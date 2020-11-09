//Function to delete a file
function deleteFile(fileName,dir,confirm) {
    if (confirm)
        var del = confirm("Confirm delete file: "+fileName);
        if ( del ) { 
            $.get("cgi-bin/ui_sdcard.cgi", {cmd: "del_file",file: fileName});
            getFiles(dir);
        }
    else {
        $.get("cgi-bin/ui_sdcard.cgi", {cmd: "del_file",file: fileName});
        getFiles(dir);
    }
}

function openFile(file) {
    var file_info = file.split(".");       
    if (file_info[1] == "jpg")
    $('#modal_picture_content').html("<img class='w3-modal-content w3-center' src='"+file+";>");
    else if (file_info[1] == "mp4")
    $('#modal_picture_content').html("<video width='130%'  controls muted> <source src='"+file+"' type='video/mp4'>not supported</video>");
    document.getElementById('modal_picture').style.display='block'
}



function getFiles(dir) {
    // Get files from dir
    $.getJSON("cgi-bin/ui_sdcard.cgi", {cmd: "events", dir: dir}, function(data_files){             
        $('#'+dir).html(" <p><button id='del_"+dir+"' class='w3-btn w3-theme'>Delete selected</button></p>\
        <table class='w3-table-all' id='result_"+dir+"'>\
        <thead>\
          <tr class='w3-theme'>\
            <th>Filename</th>\
            <th>Size</th>\
            <th>Date</th>\
            <th>Actions</th>\
          </tr>\
        </thead>\
        <tbody>");
        if (data_files.length == 0)
            $('#'+dir).html("<h1>No files found</h1>");

        for (const data of data_files ) {
         var filename = data.file.replace(/^.*[\\\/]/, '')
         var file_info = filename.split(".");       
         var html_photo = "";
         if (file_info[1] == "jpg")
            html_photo = "<span onclick='openFile(\""+data.file+"\");' title='View picture'><i class='far fa-eye'></i>";
         else if (file_info[1] == "mp4")
            html_photo = "<span onclick='openFile(\""+data.file+"\");' title='View video'><i class='far fa-eye'></i>";
         $('#result_'+dir).append("<tr> \
         <td>"+filename+"</td> \
         <td>"+data.size+"</td> \
         <td>"+data.date+"</td> \
         <td> \
             <a href=\""+data.file+"\" download><i class='fas fa-download' title='Download file'></i></a> \
            <span onclick=\"deleteFile('"+data.file+"','"+dir+",true')\"><i class='fas fa-trash' title='Delete file'></i></span>\
            "+html_photo+"\
            </td></tr>");
        }
        $('#'+dir).append("</tbody></table><p></p>");

        var table = $('#result_'+dir).DataTable();
        $('#result_'+dir+' tbody').on( 'click', 'tr', function () {
            $(this).toggleClass('selected');
        } );
     
        $('#del_'+dir).click( function () {
            var del = confirm("Confirm delete of "+ table.rows('.selected').data().length +" files");
            if(del) {
                table.rows('.selected').data().each( function ( value, index ) {   
                    filename = value[3].split("\"");                 
                    deleteFile(filename[1],dir,false);
                } );
            }
        } );

    });

}


function showEvents() {

    $.getJSON("cgi-bin/ui_sdcard.cgi", {cmd: "events", dir: "motion"}, function(data){             
        
        var events = data.filter(item => item.file.endsWith(".jpg") || item.file.endsWith(".mp4") ).map(item => {
            return { date: new Date(item.date),
                    detail: { 
                        file : item.file
                    }}; 
        });
        console.log(events);
    if(events.length > 0) {
       var chart = eventDrops({
        range: {
            start: events.reduce((a, b) => a.date < b.date ? a : b).date,
            end: events.reduce((a, b) => a.date > b.date ? a : b).date
          },
          drop: {
              date: d => d.date,
              onClick : data => {
                openFile(data.detail.file);
              }
          }
        });
        d3.select('#events-graph').html("").datum([{ name: "Events", data : events}]).call(chart);
        } else {
            d3.select('#events-graph').html("<h1>No events found</h1>")
        }
    });

}

//Function loaded when script load
function onLoad() {
    //Activate accordion
    accordion();
    //Get configuration
    getFiles('motion');
}

onLoad();


