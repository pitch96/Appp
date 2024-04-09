
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },


    onDeviceReady: function () {

        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
           // util.return_last_page();
        }, false);

        $(document).ready(function (e) {


            util.getCurrentGeoLocation();

            $("#btnVoltar").click(function () {
                util.return_last_page();
            })

            screen.orientation.lock('portrait');

            var canvas = document.getElementById("padCanvas");
            var signaturePad = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                minWidth: 0.5,
                maxWidth: 1
            });

            document.signaturePad = signaturePad;
            window.signaturePad = signaturePad;


            $("#myform").on('submit',  function (e) {
                e.preventDefault();

                var formData = new FormData(this);
                formData.append('user', window.localStorage.getItem("login"));
                if(document.current_position != null){
                    formData.append('latitude', document.current_position.coords.latitude);
                    formData.append('longitude',document.current_position.coords.longitude);
                }


                var assinatura = $('#signImg').attr('src');
                if(assinatura != null) {
                    var blob = util.dataURItoBlob(assinatura);
                    formData.append('img_assinatura', blob, 'assinatura.png');
                }

                let beforeSend = function () {
                    $('.submitBtn').attr("disabled", "disabled");
                    $('#myform').css("opacity", ".5");
                    $('#myform').attr("disabled", "disabled");
                    coreProgress.showPreloader(undefined, 0);
                }

                let success = function (msg) {
                    coreDialog.close('.preloader');
                    $('.statusMsg').html('');
                    if (msg.success) {
                        $('#myform')[0].reset();
                        navigator.notification.alert("Coleta Realizada com Sucesso!", null, "Sucesso!", 'OK');
                        $('#btnVoltar').click();
                    } else {
                        navigator.notification.alert("Houve um erro ao enviar: " + (msg.message != null ? msg.message : ""), null, "Erro", 'OK');
                    }

                    $('#myform').css("opacity", "");
                    $(".submitBtn").removeAttr("disabled");
                    $("#myform").removeAttr("disabled");
                }

                let error = function (msg) {
                    navigator.notification.alert((msg.responseJSON != null && msg.responseJSON.message != null ? msg.responseJSON.message : "Houve um erro ao enviar, por favor tente novamente!") , null, "Erro", 'OK');
                    console.log(msg);
                    coreDialog.close('.preloader');

                    $('#myform').css("opacity", "");
                    $(".submitBtn").removeAttr("disabled");
                    $("#myform").removeAttr("disabled");
                }

                navigator.notification.confirm("Você tem certeza que deseja confirmar a coleta de todas as notas contidas no manifesto?",
                    function (e) {
                        if (e == 1)
                        {
                            coleta_webservice_access.coletar_manifesto(formData, beforeSend, success, error);
                        }
                    }, 'Coletar Manifesto', 'Sim,Cancelar');

        });

        });
    },

    loadBarcode: function(){

        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if(result.cancelled)
                    return;

                var code = result.text.trim();
                /* Realizar logicas de validação do codigo capturado*/

                /*1 verificação - Tamanho do codigo capturado*/

                if(code.length != 10){
                    util.showProcessMessage(false, 'Código de Barras',  'Código Inválido. Por favor tente novamente');
                    setTimeout(app.loadBarcode, 2000);
                }
                else
                {
                    util.showProcessMessage(true, 'Código de Barras', 'Lido com sucesso');
                    document.getElementById('manifesto').value = code;
                }

            },
            function (error) {
                navigator.notification.confirm('Falha ao Escanear código de barras.\nPor favor tente novamente',
                    function (e) {
                        app.loadBarcode();
                    }, 'Erro', 'OK');
            },

            {
                preferFrontCamera : false, // iOS and Android
                showFlipCameraButton : false, // iOS and Android
                showTorchButton : true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                saveHistory: true, // Android, save scan history (default false)
                prompt : "Place a barcode inside the scan area", // Android
                resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats : "CODE_128", // default: all but PDF_417 and RSS_EXPANDED
                orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations : true, // iOS
                disableSuccessBeep: false // iOS and Android
            }

        );

    },



};
