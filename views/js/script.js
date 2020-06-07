
function loadDoc() {
    var xh=new XMLHttpRequest();
    xh.onreadystatechange=function()
    {
        if(this.readyState == 4 && this.status == 200)
        {
            loadCaractere(this);
        }
    };
    xh.open("Get","charList.xml",true);
    xh.send();
  }


function loadCaractere(xml){
    var i;
    var xmlDoc = xml.responseXML;
    var table="<tr><th>Personaj</th><th>Anime</th></tr>";
    table+="<br>";
    var x = xmlDoc.getElementsByTagName("personaj");
    for (i = 0; i <x.length; i++) {
      console.log("val i"+i);
      table += "<tr><td>" +
      x[i].getElementsByTagName("nume")[0].childNodes[0].nodeValue +
        "</td><td>" +
        x[i].getElementsByTagName("anime")[0].childNodes[0].nodeValue +
        "</td>";
    }
  document.getElementById("charTable").innerHTML = table;
}

function printTime()
{
    var d=new Date();
    document.getElementById("date").innerHTML ="Data 📅 : "+ d.toDateString();
    console.log("Data1:"+d.toDateString());
    console.log("data2"+d);

    var h=d.getHours();
    var m=d.getMinutes();
    document.getElementById("time").innerHTML = "Ora ⏰ : "+ h+ ":"+m;
    console.log(h);
}