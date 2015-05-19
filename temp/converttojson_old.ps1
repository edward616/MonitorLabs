

#Extract File
Function Expand-ZIPFile($File, $Destination)
{
    $shell = new-object -com shell.application
    $zip = $shell.NameSpace($file)
    foreach($item in $zip.items())
    {
        $shell.Namespace($destination).copyhere($item)
    }
}

#convertTo-json 2.0
function ConvertTo-Json20([object] $item)
{
    add-type -assembly system.web.extensions
    $ps_js=new-object system.web.script.serialization.javascriptSerializer
    return $ps_js.Serialize($item) 
}
#check and convertTo-string
function convertTo-String($item)
{
    #echo "hello"
	#write-output $item
	if($item -ne $null){
		$str = $item.ToString()
		#write-output $str
		return $str
	}else{
		return ""
	}
}

function addToMap($remoteInfo){
    $vmMap = @{}
    #$vmMap.Add("ComputerName",$ComputerName)
	$vmMap["ComputerName"] = convertTo-String($ComputerName)
	#$vmMap["ComputerName"] = $ComputerName.ToString()
    if($remoteInfo -ne $null){ 
		#$sessionid = convertTo-String($remoteInfo.SessionId)
        #$vmMap.Add("SessionID",$sessionid)
		$vmMap["SessionID"] = convertTo-String($remoteInfo.SessionId)
		#$state1 = convertTo-String($remoteInfo.State)
        #$vmMap.Add("State", $state1)
		$vmMap["State"] = convertTo-String($remoteInfo.State)
        #$vmMap.Add("ClientName",$remoteInfo.ClientName | convertTo-String)
		$vmMap["ClientName"] = convertTo-String($remoteInfo.ClientName)
        #$vmMap.Add("WindowStationName",convertTo-String($remoteInfo.WindowStationName))
		$vmMap.WindowStationName = convertTo-String($remoteInfo.WindowStationName)
        #$vmMap.Add("UserAccount",convertTo-String($remoteInfo.UserAccount))
		$vmMap.UserAccount = convertTo-String($remoteInfo.UserAccount)
		#$vmMap.Add("IPAddress",convertTo-String($remoteInfo.IPAddress))
		$vmMap.IPAddress = convertTo-String($remoteInfo.IPAddress)
		#$vmMap.Add("LastInputTime",convertTo-String($remoteInfo.LastInputTime))
		$vmMap.LastInputTime = convertTo-String($remoteInfo.LastInputTime)
		#$vmMap.Add("LoginTime",convertTo-String($remoteInfo.LoginTime))
		$vmMap.LoginTime = convertTo-String($remoteInfo.LoginTime)
        <# if($remoteInfo.IPAddress -ne $null){
            $vmMap.Add("IPAddress",$remoteInfo.IPAddress.ToString())
        }else{
            $vmMap.Add("IPAddress","")
        }
        if($remoteInfo.LastInputTime -ne $null){
            $vmMap.Add("LastInputTime",$remoteInfo.LastInputTime.ToString())
        }else{
            $vmMap.Add("LastInputTime","")
        }
        if($remoteInfo.LoginTime -ne $null){
            $vmMap.Add("LoginTime",$remoteInfo.LoginTime.ToString())
        }else{
            $vmMap.Add("LoginTime","")
        } #>
        #$vmMap.Add("LoginTime",$remoteInfo.LoginTime)
        #$vmMap.Add("LastInputTime",$remoteInfo.LastInputTime)      
    }else{
        #$vmMap.Add("excepMes",convertTo-String($excepMes))
		$vmMap["excepMes"] = convertTo-String($excepMes)
    }

    return $vmMap

}


#obsulte path
$current_path = Split-Path -Parent $MyInvocation.MyCommand.Definition

#Constant
$PSTERMINALSERVICES_MODULE_PATH = $current_path+"\PSTerminalServices.zip"
$PS_SCRIPT_PATH = $current_path+ "\Scripts"
$LABS_INFO_PATH = $current_path+"\labsInfo\"
$LABS_FILE_PATH = $LABS_INFO_PATH + "*.csv"
$PSTERMINALSERVICES_EXTRACT_PATH = $current_path+ "\Scripts\PSTerminalServices"
$UPLOAD_URL = "http://localhost:41663/VMTSSessions/PostData"
$date = get-date
$date_str = $date.toString().replace("/","-").replace(":","-")



$ZIP_Item = Get-Item -Path $PSTERMINALSERVICES_MODULE_PATH
$Unzip_Exist = Test-Path -Path $PSTERMINALSERVICES_EXTRACT_PATH
if($ZIP_Item -And !$Unzip_Exist)
{
    try
    {
        $Dir_Item = New-Item -ItemType directory -Path $PS_SCRIPT_PATH
        Expand-ZIPFile -File $PSTERMINALSERVICES_MODULE_PATH -Destination $PS_SCRIPT_PATH
    }catch [Exception]{
	    Echo $_.Exception.Message
	}
}


#Import-Module
Import-Module -Name $PSTERMINALSERVICES_EXTRACT_PATH
Import-Module ActiveDirectory

$domainInfo = Get-ADDomain -Current LocalComputer
$DomainComputers = Get-ADComputer -Filter 'Name -like "WM-*"'
$vmInfoArray = @()
ForEach($Computer in $DomainComputers){

    $ComputerName = $Computer.Name
    try{
        $remoteInfo = Get-TSSession -ComputerName $ComputerName -State Active | Select SessionID,DomainName,State,ClientName,WindowStationName,UserAccount,IPAddress,LoginTime,LastInputTime
    }catch [Exception] {
        $excepMes = $_.Exception.Message
        write-output $excepMes
    }
   
    $vmMap = addToMap($remoteInfo)
    #$vmMap.Add("DomainName",convertTo-String($domainInfo.Name))
	$vmMap["DomainName"] = convertTo-String($domainInfo.Name)
	#write-output $vmMap
	#echo $vmMap
	#$xxx = ConvertTo-Json20($vmMap)
	#echo $xxx
	<# echo "xxxxxxxxxxxx"
	$x1 = @{xx="rrr"}
	$x1_json = ConvertTo-Json20($x1)
	echo $x1_json #>
    $vmInfoArray += $vmMap
}
write-output $vmInfoArray
$remoteInfoJson = ConvertTo-Json20($vmInfoArray)

echo $remoteInfoJson


#send data to server
$URI = "http://10.30.178.210:3000/saveLabsInfo"
$wpassword = "Dell8866"
$wusername = "hzhou2"
$password = ConvertTo-SecureString $wpassword -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($wusername, $password)

$request = [System.Net.WebRequest]::Create($URI)
$request.ContentType = "text/plain"
$request.Method = "POST"
$request.Credentials = $credential

$request.ServicePoint.ConnectionLimit =10;
$conn=$request.ServicePoint.CurrentConnections
if ($conn -ge 8) {
    $request.ServicePoint.CloseConnectionGroup("")
}

# $request | Get-Member  for a list of methods and properties 

try
{
    $requestStream = $request.GetRequestStream()
    $streamWriter = New-Object System.IO.StreamWriter($requestStream)
    $streamWriter.Write($remoteInfoJson)
}

finally
{
    if ($null -ne $streamWriter) { $streamWriter.Dispose() }
    if ($null -ne $requestStream) { $requestStream.Dispose() }
}

$res = $request.GetResponse()
echo $res



