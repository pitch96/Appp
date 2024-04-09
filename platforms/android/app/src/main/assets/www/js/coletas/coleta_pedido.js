
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },

    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },


    onDeviceReady: function () {
          var intervaloLocation = parseInt(window.localStorage.getItem("geo-loc-time"));
        intervaloLocation = intervaloLocation * 1000;
        setInterval(webservice_access.getLocationAndSendData, intervaloLocation);

        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);

        $(document).ready(function (e) {


            util.getCurrentGeoLocation();

            $("#btnVoltar").click(function () {
                util.return_last_page();
            })

            screen.orientation.lock('portrait');




            $("#myform").on('submit',  function (e) {
                e.preventDefault();

                var formData = new FormData(this);

                formData.append('user', window.localStorage.getItem("login"));
                if(document.current_position != null){
                    formData.append('latitude', document.current_position.coords.latitude);
                    formData.append('longitude',document.current_position.coords.longitude);
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
                        navigator.notification.alert("Houve um erro ao enviar, por favor tente novamente!", null, "Erro", 'OK');
                    }

                    $('#myform').css("opacity", "");
                    $(".submitBtn").removeAttr("disabled");
                    $("#myform").removeAttr("disabled");
                }

                let error = function (msg) {
                    navigator.notification.alert("Houve um erro ao enviar, por favor tente novamente!", null, "Erro", 'OK');
                    console.log(msg);
                    coreDialog.close('.preloader');

                    $('#myform').css("opacity", "");
                    $(".submitBtn").removeAttr("disabled");
                    $("#myform").removeAttr("disabled");
                }

                coleta_webservice_access.coletar_pedido(formData, beforeSend, success, error);
        });


           app.initQuagga();



        });
    },

    initQuagga: function(){
        document.closeScanner = function(){
            coreDialog.close('#dialogScanner');screen.orientation.lock('portrait');Quagga.stop();
        }

        var lock_wait = false;
        Quagga.onDetected(function(result) {
            var code = result.codeResult.code;

            /* Realizar logicas de validação do codigo capturado*/

            /*1 verificação - Tamanho do codigo capturado*/
            if (code.length != 10) {
                navigator.notification.alert('Tente melhorar a posição do seu mobile. Mantenha a camera paralela ao codigo de barra', null, "Atenção!", 'OK');
            }
            else {
                if (!lock_wait) {
                    lock_wait = true;
                    navigator.notification.confirm('Nº Pedido: ' + code,
                        function (e) {
                            if (e == 1) {
                                document.getElementById('pedido').value = code;
                                //Stop camera quando acha
                                Quagga.stop();
                                document.closeScanner();
                            }

                            lock_wait = false;
                        }, 'Confirmar Dados', 'OK,Cancelar');


                    if (document.barcodeScanner.lastResult !== code) {
                        document.barcodeScanner.lastResult = code;
                    }
                }
            }
        });
    },

    loadBarcode: function(){


        window.plugins.GMVBarcodeScanner.scan({}, function(err, result) {

            //Handle Errors
            if(err || !result) return;



            navigator.notification.confirm("Codigo:"  + result,
                function (e) {
                app.loadBarcode();

                }, 'Confirmar Dados', 'OK,Cancelar');


        });



    },



};
