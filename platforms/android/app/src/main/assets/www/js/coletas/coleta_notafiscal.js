/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
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
            //util.return_last_page();
        }, false);

        $(document).ready(function (e) {


            util.getCurrentGeoLocation();

            app.loadCentros();

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
                formData.set("cnpj", $('#cnpj').val());
                formData.append('user', window.localStorage.getItem("login"));
                if(document.current_position != null){
                    formData.append('latitude', document.current_position.coords.latitude);
                    formData.append('longitude',document.current_position.coords.longitude);
                }
                formData.append('nfe_key', document.nfe_key != null ? document.nfe_key : '');

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

                coleta_webservice_access.coletar_notafiscal(formData, beforeSend, success, error);
        });


        });
    },



    loadCentros: function(){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.success == 'true') {
                window.localStorage.setItem("centros", JSON.stringify(msg.centros));
                app.load_centros_options();
            }
        }

        let error = function (msg) {
            app.load_centros_options();
            coreDialog.close('.preloader');
            console.log(msg);
        }


        webservice_access.get_centros(beforeSend, success, error);

    },

    load_centros_options : function(){
        document.centros = JSON.parse(window.localStorage.getItem("centros"));
        $.each(document.centros, function (i, item) {
            $("#cnpj").append(new Option(item.nome_centro, item.cnpj));
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

                if(code.length != 44 && code.length != 12){
                    util.showProcessMessage(false, 'Código de Barras',  'Código Inválido. Por favor tente novamente');
                    setTimeout(app.loadBarcode, 2000);
                }
                else
                    {
                    /*Verifica qual é o tamanho do mobile do usuario*/
                    /* Recupera valores quebrados (Nfe, serie e CNPJ) */
                    if (code.length == 44) {
                        var var_nfe = code.substring(25, 34);
                        var var_serie = code.substring(22, 25);
                        var var_cnpj_comp = code.substring(6, 20);
                        document.nfe_key = code;
                    } else if (code.length == 12) {
                        var var_nfe = code.substring(3, 12);
                        var var_serie = code.substring(0, 3);
                        var var_cnpj_comp = '';
                        document.nfe_key = '';
                    }

                    var centro = "Centro não encontrado";
                    document.getElementById('cnpj').value = var_cnpj_comp;

                    if ($("#cnpj :selected").text() != null && $("#cnpj :selected").text() != '')
                        centro = $("#cnpj :selected").text();

                        util.showProcessMessage(true, 'Código de Barras', 'Lido com sucesso');

                   // navigator.notification.confirm('Nota fiscal: ' + var_nfe + '\n Série: ' + var_serie + '\n Origem: ' + centro,
                     //   function (e) {
                      //      if (e == 1) {
                                document.getElementById('nfe').value = var_nfe;
                                document.getElementById('serie').value = var_serie;
                                document.getElementById('cnpj').value = var_cnpj_comp;
                      //      }
                    //    }, 'Confirmar Dados', 'OK,Cancelar');
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
