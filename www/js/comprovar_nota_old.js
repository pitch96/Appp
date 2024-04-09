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


    loadCheckinData: function(){

        //verifica se existe checkin pendente de finalização, caso exista, copia os dados para comprovação
        var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
        if(checkin_nota != null)
            if(checkin_nota != null)
            {
                checkin_nota = JSON.parse(checkin_nota);
                document.nfe_key = checkin_nota.chave_nota;
                document.getElementById('nfe').value = checkin_nota.num_nfe;
                document.getElementById('serie').value = checkin_nota.serie_nfe;
                document.getElementById('cnpj').value = checkin_nota.cnpj.padStart(14, '0');

                $('#nfe').prop('readonly', true);
                $('#serie').prop('readonly', true);
                $('#cnpj').attr("disabled", true);
                $("#button_scanner").prop("disabled",true);

            }

    },
    onDeviceReady: function () {

        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);

        $(document).ready(function (e) {

            util.getCurrentGeoLocation();

            app.loadCentros();
            app.load_status_transporte();
            app.load_tipo_relacao_recebedores();

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

                if(!app.validations())
                    return;

                var user = window.localStorage.getItem("login");



                var formData = new FormData(this);

                formData.set("cnpj", $('#cnpj').val());

                formData.append('user', user);

                var latitude, longitude = '';
                if(document.current_position != null){
                    latitude = document.current_position.coords.latitude;
                    longitude = document.current_position.coords.longitude;
                }

                formData.append('latitude', latitude);
                formData.append('longitude',longitude);
                formData.append('status', '');
                formData.append('nfe_key', document.nfe_key != null ? document.nfe_key : '');


                var data_hora =  moment().utc().add(-3, 'hours').format("YYYY-MM-DDTHH:mm:ss");
                formData.append('data_hora', data_hora);

                //salva o json do formdata para envio posterior, se for o caso
                let dataCache = util.formData_toJson(formData);

                //pega todas as imagens e adiciona no form data como BLOB
                var imgs = document.getElementsByClassName("foto_nota_img");
                dataCache.arquivo = [];
                for (var i = 0; i < imgs.length; i++) {
                    var image = imgs[i].src;
                    var blob = util.dataURItoBlob(image);
                    formData.append('arquivo[]', blob, 'arquivo.jpg');
                    dataCache.arquivo.push(image);

                }

                var assinatura = $('#signImg').attr('src');
                if(assinatura != null) {
                    var blob = util.dataURItoBlob(assinatura);

                    formData.append('img_assinatura', blob, 'assinatura.png');
                    dataCache.img_assinatura = assinatura;
                }

                console.log(dataCache);
                var domain =  window.localStorage.getItem("domain");
                var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=EnviarConfirmacaoNota';


                $.ajax({
                    type: 'POST',
                    url: url,
                    data: formData,
                    contentType: false,
                    cache: false,
                    processData: false,
                    timeout: 50000,
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

                            var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
                            if(checkin_nota != null)
                                window.localStorage.removeItem("dados_ultimo_checkin_nota");

                            navigator.notification.alert("Enviado com sucesso!", null, "Sucesso!", 'OK');
                            $('#btnVoltar').click();
                        } else {
                            $('.statusMsg').html('<span class="fg-red">Houve um problema ao enviar, por favor tente novamente: ' + msg.message + '</span>');
                        }
                        $('#myform').css("opacity", "");
                        $(".submitBtn").removeAttr("disabled");
                        $("#myform").removeAttr("disabled");

                    },
                    error: function (msg) {
                        console.log(msg);
                        coreDialog.close('.preloader');

                        $('#myform').css("opacity", "");
                        $(".submitBtn").removeAttr("disabled");
                        $("#myform").removeAttr("disabled");

                        var erro = '';

                        if(msg.readyState == 0 || msg.statusText == 'timeout' || msg.statusText == 'Request Timeout') {

                            //em caso de timeout, pergunta se quer salvar os dados e enviar mais tarde
                            let question = '';
                            if(msg.statusText == 'timeout' || msg.statusText == 'Request Timeout') {
                                erro = 'Houve erro de Timeout';
                                question = 'O servidor demorou para responder, deseja salvar os dados e enviar mais tarde?';
                            }
                            else if(msg.readyState == 0 ) {
                                erro = 'Sem conexão'
                                question = 'Não foi possível conectar ao servidor, deseja salvar os dados e enviar mais tarde?';
                            }

                            navigator.notification.confirm(question,
                                function (e) {
                                    if (e == 1)
                                    {
                                        var checkout_cache = window.localStorage.getItem("checkout_cache");
                                        if(checkout_cache != null && checkout_cache != '')
                                            checkout_cache = JSON.parse(checkout_cache);
                                        else
                                            checkout_cache = [];

                                        var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
                                        dataCache.dados_nota = checkin_nota;

                                        checkout_cache.push(dataCache);
                                        window.localStorage.setItem("checkout_cache", JSON.stringify(checkout_cache));

                                        if(checkin_nota != null) window.localStorage.removeItem("dados_ultimo_checkin_nota");
                                        $('#btnVoltar').click();
                                    }
                                }, 'Salvar Dados', 'Sim,Cancelar');
                        } else {
                            if (msg.responseJSON != null && msg.responseJSON.message)
                                erro = msg.responseJSON.message;
                            else if (msg.statusText == 'timeout')
                                erro = 'Houve erro de Timeout';
                            else if(msg.readyState == 4)
                                erro = msg.responseText;
                            else
                                erro = JSON.stringify(msg);
                            navigator.notification.alert(erro, null, "Erro!", 'OK');


                            $('.statusMsg').html('<span class="fg-red">Houve um problema ao enviar, por favor tente novamente:' + erro + '</span>');
                        }
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
                    alert('Falha ao coletar Foto: ' + message);
                }
            }

            document.removeElement = function (element) {

                navigator.notification.confirm('Você confirma a exclusão desta foto?',
                    function (e) {
                        if (e == 1)
                            $("#" + element).remove();
                    }, 'Excluir Foto', 'Sim,Cancelar');


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

            })

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
            if(code.length != 44 && code.length != 12){

                navigator.notification.alert('Tente melhorar a posição do seu mobile. Mantenha a camera paralela ao codigo de barra', null, "Atenção!", 'OK');
            }
            else {

                /*Verifica qual é o tamanho do mobile do usuario*/
                var ratio = window.devicePixelRatio || 1;
                var w = screen.width * ratio;
                var h = screen.height * ratio;


                /* Recupera valores quebrados (Nfe, serie e CNPJ) */
                if(code.length == 44) {
                    var var_nfe = code.substring(25, 34);
                    var var_serie = code.substring(22, 25);
                    var var_cnpj_comp = code.substring(6, 20);
                    document.nfe_key = code;
                }else if(code.length == 12){
                    var var_nfe = code.substring(3, 12);
                    var var_serie = code.substring(0, 3);
                    var var_cnpj_comp = '';
                    document.nfe_key = '';
                }


                var centro = "Centro não encontrado";
                document.getElementById('cnpj').value = var_cnpj_comp;

                if($("#cnpj :selected").text() != null && $("#cnpj :selected").text() != '')
                    centro = $("#cnpj :selected").text();

                if (!lock_wait) {
                    lock_wait = true;
                    navigator.notification.confirm('Nota fiscal: ' + var_nfe + '\n Série: ' + var_serie + '\n Origem: ' + centro,
                        function (e) {
                            if (e == 1) {
                                document.getElementById('nfe').value = var_nfe;
                                document.getElementById('serie').value = var_serie;
                                document.getElementById('cnpj').value = var_cnpj_comp;

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
    addImage: function(dataUrl){

        window.imgCount += 1;
        $("#image_div").append("<div class='row padding1 shadow-1 margin2' id='row_img_" + window.imgCount + "'>" +
            "<div class='cell align-center'>" +
            "<img src='' class='foto_nota_img margin2' id='foto_nota_img_" + window.imgCount + "' /></div>" +
            "<div class='cell align-center'><button class='action-button mini bg-red fg-white place-right' onclick='removeElement(\"" + "row_img_" + window.imgCount + "\");event.preventDefault();'><span class='i-close'></span></button></div>" +
            "</div>");

        var image = document.getElementById('foto_nota_img_' +  window.imgCount);
        //image.src =  imageURI.url;
        image.src = dataUrl;

    },

    validations : function(){

        let msg = '';

        if($('#nfe').val() == '')
            app.show_validation_message('Preencha o número da NFE', '#nfe', '#tab_dados');
        else if($('#serie').val() == '')
            app.show_validation_message('Preencha a serie da NFE', '#nfe', '#tab_dados');
        else if($('#nome_recebedor').val() == '')
            app.show_validation_message('Preencha o nome do recebedor', '#nome_recebedor', '#tab_assinatura');
        else if($('#rg_recebedor').val() == '')
            app.show_validation_message('Preencha o RG do recebedor', '#rg_recebedor', '#tab_assinatura');
        else if($('#tipo_relacao_recebedor').selectedIndex == 0)
            app.show_validation_message('Selecione o tipo de relação com recebedor', '#tipo_relacao_recebedor', '#tab_assinatura');
        else
            return true;

        return false;

    },

    show_validation_message: function(msg, field, tab){
        navigator.notification.alert(msg, function () {
            $(tab).click();
            $(field).focus();
        }, "Atenção!", 'OK');
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
                app.loadCheckinData();
            }
        }

        let error = function (msg) {
            app.load_centros_options();
            app.loadCheckinData();

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


    load_status_transporte: function(){


        let beforeSend = function () {
            //coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            console.log(msg);
            if (msg.success == 'true') {
                window.localStorage.setItem("status_transportes", JSON.stringify(msg.status_transporte));
                app.load_status_options();
            }
            coreDialog.close('.preloader');
        }

        let error = function (msg) {
            app.load_status_options();
            console.log(msg);
            coreDialog.close('.preloader');
        }

        webservice_access.get_list_status_transporte(beforeSend, success, error);

    },

    load_status_options : function(){
        document.status_transporte = JSON.parse(window.localStorage.getItem("status_transportes"));
        $.each(document.status_transporte, function (i, item) {
            $("#status_transporte").append(new Option(item.id + ' - ' + item.descricao, item.id));
        });
        $("#status_transporte").val("35");
    },


    load_tipo_relacao_recebedores: function(){


        let beforeSend = function () {
            //coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            console.log(msg);
            if (msg.success == 'true') {
                window.localStorage.setItem("tipo_relacao_recebedores", JSON.stringify(msg.tipo_relacao_recebedores));
                app.load_tipo_relacao_recebedores_options();
            }
            //coreDialog.close('.preloader');
        }

        let error = function (msg) {
            app.load_tipo_relacao_recebedores_options();
            console.log(msg);
            //coreDialog.close('.preloader');
        }

        webservice_access.get_list_tipo_relacao_recebedores(beforeSend, success, error);

    },

    load_tipo_relacao_recebedores_options : function(){
        document.status_transporte = JSON.parse(window.localStorage.getItem("tipo_relacao_recebedores"));
        $.each(document.status_transporte, function (i, item) {
            $("#tipo_relacao_recebedor").append(new Option(item.id + ' - ' + item.descricao, item.descricao));
        });
        $("#tipo_relacao_recebedor").prop("selectedIndex", 0);
    },

    loadBarcode: function(){

        cordova.plugins.barcodeScanner.scan(
            function (result) {
                var code = result.text;
                /* Realizar logicas de validação do codigo capturado*/

                /*1 verificação - Tamanho do codigo capturado*/
                if (code.length != 44 && code.length != 12) {
                    navigator.notification.alert('Tente melhorar a posição do seu mobile. Mantenha a camera paralela ao codigo de barra', null, "Atenção!", 'OK');
                }
                else {

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


                    navigator.notification.confirm('Nota fiscal: ' + var_nfe + '\n Série: ' + var_serie + '\n Origem: ' + centro,
                        function (e) {
                            if (e == 1) {
                                document.getElementById('nfe').value = var_nfe;
                                document.getElementById('serie').value = var_serie;
                                document.getElementById('cnpj').value = var_cnpj_comp;
                            }
                        }, 'Confirmar Dados', 'OK,Cancelar');
                }
            },
            function (error) {
                alert("Falha ao Escanear código de barras: " + error);
            }
        );

    },



};
