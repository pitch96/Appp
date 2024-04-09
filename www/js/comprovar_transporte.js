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


        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);

        app.loadCentros();

        $(document).ready(function (e) {

            document.closeScanner = function(){
                coreDialog.close('#dialogScanner');screen.orientation.lock('portrait');Quagga.stop();
            }

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
                var user = window.localStorage.getItem("login");
                var is_debug =  window.localStorage.getItem("is_debug");

                var formData = new FormData(this);


                //pega todas as imagens e adiciona no form data como BLOB
                var imgs = document.getElementsByClassName("foto_comprovante");

                for (var i = 0; i < imgs.length; i++) {
                    var image = imgs[i].src;
                    var blob = util.dataURItoBlob(image);
                    formData.append('arquivo[]', blob, 'arquivo.jpg');

                }


                formData.append('user', user);
                formData.append('latitude', '');
                formData.append('longitude', '');
                formData.append('status', '');


                var assinatura = $('#signImg').attr('src');
                if(assinatura != null) {
                    var blob = util.dataURItoBlob(assinatura);
                    formData.append('img_assinatura', blob, 'assinatura.jpeg');
                }

                var domain =  window.localStorage.getItem("domain");
                var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=EnviarConfirmacaoTransporte';


                $.ajax({
                    type: 'POST',
                    url: url,
                    data: formData,
                    contentType: false,
                    cache: false,
                    processData: false,
                    headers: {
                        'apiKey': '78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547',
                    },
                    beforeSend: function () {
                        $('.submitBtn').attr("disabled", "disabled");
                        $('#myform').css("opacity", ".5");
                        $('#myform').attr("disabled", "disabled");
                        coreProgress.showPreloader(undefined, 0);
                    },
                    success: function (msg) {
                        coreDialog.close('.preloader');
                        $('.statusMsg').html('');
                        if (msg.success == 'true') {
                            $('#myform')[0].reset();
                            navigator.notification.alert("Enviado com sucesso!", null, "Sucesso!", 'OK');
                            window.location = 'index.html';
                        } else {
                            $('.statusMsg').html('<span class="fg-red">Houve um problema ao enviar, por favor tente novamente: ' + msg.message + '</span>');
                        }
                        $('#myform').css("opacity", "");
                        $(".submitBtn").removeAttr("disabled");
                        $("#myform").removeAttr("disabled");

                    },
                    error: function (msg) {

                        coreDialog.close('.preloader');
                        var erro = '';
                        if(msg.responseJSON.message)
                            erro = msg.responseJSON.message;
                        else
                            erro = JSON.stringify(msg);

                        navigator.notification.alert(erro, null, "Erro!", 'OK');
                        console.log(msg);

                        $('.statusMsg').html('<span class="fg-red">Houve um problema ao enviar, por favor tente novamente:' + erro + '</span>');
                        $('#myform').css("opacity", "");
                        $(".submitBtn").removeAttr("disabled");
                        $("#myform").removeAttr("disabled");
                    }

                });


            });

            window.imgCount = 0;
            //Métodos da camera
            window.getPicture = function () {
                navigator.camera.getPicture(onSuccess, onFail, {
                    quality: 15,
                    destinationType: Camera.DestinationType.DATA_URL,
                    correctOrientation: true

                });

                function onSuccess(imageURI) {
                    app.addImage("data:image/jpeg;base64," + imageURI.url);

                }


                function onFail(message) {
                    //alert('Falha ao coletar Foto: ' + message);
                }
            }


            //adiciona imagem do arquivo
            $("#add_picture").change(function () {
                if (this.files && this.files[0]) {
                    var reader  = new FileReader();
                    reader.readAsDataURL(this.files[0]);
                    reader.onload =  function(e){
                        app.addImage(e.target.result);
                    };

                }

            });



            var lock_wait = false;
            Quagga.onDetected(function(result) {
                var code = result.codeResult.code;
                code = code.replace(/^\s+|\s+$/g,"");


                if (!lock_wait) {
                    lock_wait = true;
                    navigator.notification.confirm('Nº documento de transporte: \n\n' + code + ' ?',
                        function (e) {
                            if (e == 1) {
                                document.getElementById('numero_dt').value = code;
                                //Stop camera quando acha
                                Quagga.stop();
                                document.closeScanner();

                            }

                        }, 'Confirmar Dados', 'OK,Cancelar');


                    if (document.barcodeScanner.lastResult !== code) {
                        document.barcodeScanner.lastResult = code;
                    }
                }


            });

        });
    },

    addImage: function(dataUrl){

        window.imgCount += 1;
        $("#image_div").append("<div class='row padding1 shadow-1 margin2' id='row_img_" + window.imgCount + "'>" +
            "<div class='cell align-center'>" +
            "<img src='' class='foto_comprovante margin2' id='foto_comprovante_" + window.imgCount + "' /></div>" +
            "<div class='cell align-center'><button class='action-button mini bg-red fg-white place-right' onclick='removeElement(\"" + "row_img_" + window.imgCount + "\");event.preventDefault();'><span class='i-close'></span></button></div>" +
            "</div>");

        var image = document.getElementById('foto_comprovante_' +  window.imgCount);
        //image.src =  imageURI.url;
        image.src = dataUrl;

    },


    loadCentros: function(){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.success == 'true') {
                document.centros = msg.centros;
                $.each(document.centros, function (i, item) {
                    $("#cnpj").append(new Option(item.nome_centro, item.cnpj));
                });
            }
        }
        let error = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
        }


        webservice_access.get_centros(beforeSend, success, error);

    }


};
