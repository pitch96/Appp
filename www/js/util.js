

function getBlobXMLHttpRequest() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.responseType = "blob";
    xhr.send();
    return xhr.response;
}



var util = {
    //Retorna um blob a partir de uma URL

    getBlob: function (url) {

            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.responseType = "blob";
            xhr.send();
            return xhr.response;
    },
     dataURItoBlob1: function(dataURI) {
    var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
    return new Blob([atob(arr[1])], {type:mime});
    },

     dataURItoBlob: function(dataURI) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
        _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
},


    getCurrentGeoLocation:  function(sucessCallBack = null, errorCallBack = null){
        var onSuccess = null;
        if(sucessCallBack != null)
            onSuccess = sucessCallBack;
        else {
             onSuccess = function (position) {
                document.current_position = position;
                console.log(document.current_position);
            };
        }
        var onError = null;
        if(errorCallBack != null)
            onError = errorCallBack;
        else {
            onError = function (error) {
                console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n')
            }
        }

        cordova.plugins.locationAccuracy.request(function () {
                console.log('locationAccuracy On');
              navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true });
            },  function (error) {
                console.log("Error requesting location accuracy: " + JSON.stringify(error));
                geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: false });

            }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
        );
    },


    getSyncData: function (url, responseType) {

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.responseType = responseType;
        xhr.send();
        return xhr.response;
    },

    dataURItoBlob1: function(dataURI) {
        var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
        return new Blob([atob(arr[1])], {type:mime});
    },

    dataURItoBlob: function(dataURI) {
        // convert base64 to raw binary data held in a string
        var byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        var arrayBuffer = new ArrayBuffer(byteString.length);
        var _ia = new Uint8Array(arrayBuffer);
        for (var i = 0; i < byteString.length; i++) {
            _ia[i] = byteString.charCodeAt(i);
        }

        var dataView = new DataView(arrayBuffer);
        var blob = new Blob([dataView], { type: mimeString });
        return blob;
    },


    get_breadcrumb: function(){
        var txtBreacrumb  = sessionStorage.getItem("breadcrumb");
        var breadcrumb = [];
        if(txtBreacrumb != null)
            breadcrumb = JSON.parse(txtBreacrumb);
        return breadcrumb;
    },

    add_path_to_breadcrumb: function(url) {

        var txtBreacrumb  = sessionStorage.getItem("breadcrumb");
        var breadcrumb = this.get_breadcrumb();
        breadcrumb.push({'url': url });
        this.save_breadcrumb(breadcrumb);
    },

    save_breadcrumb : function(breadcrumb){

        var json = JSON.stringify(breadcrumb);
        console.log(json);
        sessionStorage.setItem("breadcrumb", json);

    },

    return_last_page: function () {
        var breadcrumb = this.get_breadcrumb();
        if(breadcrumb.length > 0) {
            var crumb = breadcrumb[breadcrumb.length - 1];
            breadcrumb.pop(breadcrumb.length - 1);
            this.save_breadcrumb(breadcrumb);
            console.log(crumb.url);
            window.location = crumb.url;
        }
    },

    formData_toJson: function (formData) {
        let jsonObject = {};

        for (const [key, value]  of formData.entries()) {
            jsonObject[key] = value;
        }
        return jsonObject;
    },

    json_toFormData: function (json_object) {
        let form_data = new FormData();
        for ( var key in json_object ) {
            form_data.append(key, json_object[key]);
        }
        return form_data;

    },
    padLeft: function (data,size,paddingChar) {
        return (new Array(size + 1).join(paddingChar || '0') + String(data)).slice(-size);

    },

    showProcessMessage: function (success, title = '' ,message = '', timeout = 2000) {


        coreDialog.open('#dialogProcessMessage');
        $('#process-message-title').html(title);
        $('#process-message-text').html(message);


        if(success){
            var audio = new Audio('../assets/audio/beep-03-positive.wav');
            audio.play();
            $('#process-message').attr('src', '../img/process-success.gif');
        }
        else{

            var audio = new Audio('../assets/audio/beep-05-negative.wav');
            audio.play();
            $('#process-message').attr('src', '../img/process-fail.gif');

        }

        setTimeout(function () {
            coreDialog.close('#dialogProcessMessage');
        }, timeout);



    },

    toTimeZone: function (time, zone) {
    var format = 'YYYY/MM/DD HH:mm:ss -0300';
    return moment(time, format).days.ad(zone).format('YYYY/MM/DD HH:mm:ss -0300')
    },


    dividirArray : function (base, max)
    {
        var res = [];
        for (var i = 0; i < base.length; i = i+(max - 1))
            res.push(base.slice(i, (i + max -1)));
        return res;
    },

}