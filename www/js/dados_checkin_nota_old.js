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

    btn_enviar_aviso_click: function(){

      screen.orientation.lock('portrait');

        navigator.notification.confirm('Você confima o envio do mensagem de aviso para o cliente?',
            function (e) {
                if (e == 1) {

                    var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
                    checkin_nota = JSON.parse(checkin_nota);
                    var domain =  window.localStorage.getItem("domain");
                    var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetDadosClienteByNFE&num_nfe=' + checkin_nota.num_nfe + '&num_serie=' + checkin_nota.serie_nfe + '&cnpj=' + checkin_nota.cnpj;

                    $.ajax({
                        type: 'GET',
                        url: url,
                        headers: {
                            'apiKey': '78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547',
                        },
                        beforeSend: function () {
                            coreProgress.showPreloader(undefined, 0);
                        },
                        success: function (dados_cliente) {
                            coreDialog.close('.preloader');
                            //caso ja exista os dados do cliente
                            if(dados_cliente != null && dados_cliente.id > 0)
                            {
                                let destino = "";

                                if (dados_cliente.dest_cep != null && dados_cliente.dest_cep.length > 0)
                                    destino += 'cep: ' + dados_cliente.dest_cep;

                                if(destino.length == 0) {
                                    if (dados_cliente.dest_log.length > 0)
                                        destino += dados_cliente.dest_log;
                                    if (dados_cliente.dest_numero.length > 0)
                                        destino += (destino.length > 0 ? ", " : "") + dados_cliente.dest_numero;
                                }




                                app.sendWhatsappMessage("", destino, dados_cliente.telefone, document.apikey_wa, app.getWhatsappMessage());

                            }else{
                                if(checkin_nota.chave_nota.length > 0) {
                                    app.openCaptchaDialog();
                                }else{
                                    coreDialog.open('#dialogEnvioMensagem');
                                }
                            }

                        },
                        error: function (msg) {
                            coreDialog.close('.preloader');
                            console.log(msg);
                        }

                    });
                }
            }, 'Confirmar Envio Mensagem', 'SIM,Cancelar');

    },


    sendWhatsappMessage: function(origem, destino, telefone, apikey_wa, message){

        screen.orientation.lock('portrait');
        var user = window.localStorage.getItem("login");
        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=SendWhatsappMessage';

        //caso a origem nao esteja preenchida, pega os dados de localização atual e usa como origem
        if(origem.length == 0 && document.current_position != null){
            origem = document.current_position.coords.latitude + ", " + document.current_position.coords.longitude;
        }

        var formData = new FormData(this);
        formData.append('user', user);
        formData.append('endereco_origem', origem);
        formData.append('endereco_destino', destino);
        formData.append('telefone', telefone);
        formData.append('apikey_wa', apikey_wa);
        formData.append('message', message);


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
                coreProgress.showPreloader(undefined, 0);
            },
            success: function (msg) {
                coreDialog.close('.preloader');

                if(msg.success) {
                    navigator.notification.alert("Mensagem Enviada com sucesso!", null, "Sucesso!", 'OK');
                    var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
                    checkin_nota = JSON.parse(checkin_nota);
                    checkin_nota.mensagem_enviada = true;
                    window.localStorage.setItem("dados_ultimo_checkin_nota", JSON.stringify(checkin_nota));

                    $("#button_enviar_aviso").unbind("click");
                    $("#btn_aviso_text").text("Aviso já enviado");
                    $("#btn_aviso").toggleClass('bg-green bg-gray');


                }
                else
                    navigator.notification.alert(msg.message, null, "Atenção!", 'OK');
            },
            error: function (msg) {
                navigator.notification.alert("Não foi possível enviar a mensagem!", null, "Atenção!", 'OK');
                coreDialog.close('.preloader');
                console.log(msg);
            }

        });

    },

    coletarDadosClienteByDanfe: function(){

        screen.orientation.lock('portrait');
        var user = window.localStorage.getItem("login");
        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=getNfeInfo';


        var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
        checkin_nota = JSON.parse(checkin_nota);

        var formData = new FormData(this);
        formData.append('user', user);
        formData.append('chave', checkin_nota.chave_nota);
        formData.append('key', document.captcha_key);
        formData.append('captcha', $('#captcha').val());


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
                coreProgress.showPreloader(undefined, 0);
            },
            success: function (msg) {
                coreDialog.close('.preloader');
                if(msg.success == 'true')
                {
                    let destino = "";

                 if (msg.nfeInfo.dest_cep != null && msg.nfeInfo.dest_cep.length > 0)
                    destino += 'cep: ' + msg.nfeInfo.dest_cep;


                    if(destino.length == 0) {
                        if (msg.nfeInfo.dest_log != null && msg.nfeInfo.dest_log.length > 0)
                            destino += msg.nfeInfo.dest_log;
                        else if (msg.nfeInfo.dest_numero != null && msg.nfeInfo.dest_numero.length > 0)
                            destino += (destino.length > 0 ? ", " : "") + msg.nfeInfo.dest_numero;

                    }


                    app.sendWhatsappMessage("", destino, msg.nfeInfo.telefone, document.apikey_wa, app.getWhatsappMessage());
                    coreDialog.close('#dialogEnvioMensagemCaptcha');


                }else{
                    navigator.notification.alert(msg.msg, null, "Atenção!", 'OK');
                    coreDialog.close('#dialogEnvioMensagemCaptcha');
                    coreDialog.open('#dialogEnvioMensagem');
                }

            },
            error: function (msg) {
                coreDialog.close('.preloader');
                console.log(msg);
            }

        });

    },

    getWhatsappMessage: function (){

        var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
        checkin_nota = JSON.parse(checkin_nota);

        let mensagem = checkin_nota.mensagem;
        mensagem = mensagem.replace("[numero_nota]", checkin_nota.num_nfe);
        if(checkin_nota.nome_centro != null)
            mensagem = mensagem.replace("[nome_loja]", checkin_nota.nome_centro);

        if(checkin_nota.location_map_url_curta != null && checkin_nota.location_map_url_curta.length > 0)
            mensagem = mensagem.replace("[link_mapa]", checkin_nota.location_map_url_curta);
        else
            mensagem = mensagem.replace("[link_mapa]", checkin_nota.location_map_url);

        //console.log(mensagem);
        return mensagem;
    },

    openCaptchaDialog: function(){

        screen.orientation.lock('portrait');
        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetNfeCaptcha';
        $('#captcha').attr('value', '');
        document.captcha_key = '';
        $.ajax({
            type: 'GET',
            url: url,
            headers: {
                'apiKey': '78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547',
            },
            beforeSend: function () {
                coreProgress.showPreloader(undefined, 0);
            },
            success: function (msg) {

                if(msg.success == 'true')
                {
                    $('#img_captcha').on('load', function(){
                        document.captcha_key = msg.key;
                        coreDialog.open('#dialogEnvioMensagemCaptcha');
                        coreDialog.close('.preloader');
                    }).attr('src', msg.captcha);

                }
                else
                    coreDialog.close('.preloader');

            },
            error: function (msg) {
                coreDialog.close('.preloader');
                console.log(msg);
            }

        });

    },


sendMessageSimpleMessage: function () {
    let cep = $('#cep').val();
    let telefone = $('#telefone').val();

    if(cep.length == 0){
        navigator.notification.alert("É necessário preencher o CEP!", null, "ATENÇÃO!", 'OK');
        return;
    }

    if(cep.length != 8){
        navigator.notification.alert("CEP Inválido!", null, "ATENÇÃO!", 'OK');
        return;
    }

    if(telefone.length == 0){
        navigator.notification.alert("É necessário preencher o Telefone!", null, "ATENÇÃO!", 'OK');
        return;
    }
    coreDialog.close('#dialogEnvioMensagem');
    app.sendWhatsappMessage("", 'cep: ' + cep, telefone, document.apikey_wa, app.getWhatsappMessage());

},

    load_gps_navigator: function(navigator) {
        let dados_cliente = document.dados_cliente;
        if(dados_cliente != null && dados_cliente.id > 0)
        {
            let destino = "";
                if (dados_cliente.dest_log.length > 0)
                    destino += dados_cliente.dest_log;
                if (dados_cliente.dest_numero.length > 0)
                    destino += (destino.length > 0 ? ", " : "") + 'Nº ' + dados_cliente.dest_numero;
                if (dados_cliente.dest_cep != null && dados_cliente.dest_cep.length > 0)
                    destino += (destino.length > 0 ? ", " : "") + 'cep: ' + dados_cliente.dest_cep;
            console.log('destino: ' + destino);
            if(navigator == 'waze'){
                window.open("https://www.waze.com/ul?q=" + destino + "&navigate=yes", "_system")
            }else if(navigator == 'google_maps') {
                window.open("http://maps.google.com/?daddr=" + destino + "&dir_action=navigate", "_system")
            }
        }



    },
    load_dados_cliente: function(){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (dados_cliente) {
            coreDialog.close('.preloader');
            console.log(dados_cliente);
            document.dados_cliente = dados_cliente;

            //caso ja exista os dados do cliente
            if(dados_cliente != null && dados_cliente.id > 0)
             $('#navigator_gps_widget').show();

        }

        let error = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
        }

        var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
        checkin_nota = JSON.parse(checkin_nota);
        webservice_access.get_dados_cliente_by_nfe(checkin_nota, beforeSend, success, error);
    },

    onDeviceReady: function () {

        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);


        var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
        if(checkin_nota == null)
            util.return_last_page();

        app.load_dados_cliente();
        util.getCurrentGeoLocation();



        checkin_nota = JSON.parse(checkin_nota);

        var data_checkin =  moment(checkin_nota.data_checkin).format('DD/MM/YYYY HH:mm');
        $('#data_hora').html(data_checkin);
        $('#nfe').html(checkin_nota.num_nfe);
        $('#serie').html(checkin_nota.serie_nfe);
        $('#cnpj').html(checkin_nota.cnpj);
        $('#chave_acesso').html(checkin_nota.chave_nota);

        if(checkin_nota.apikey_wa != null && checkin_nota.apikey_wa.length > 0)
            $("#button_enviar_aviso").on('click', app.btn_enviar_aviso_click);

        document.apikey_wa = checkin_nota.apikey_wa;

        if(checkin_nota.mensagem_enviada != null && checkin_nota.mensagem_enviada){
            $("#button_enviar_aviso").unbind("click");
            $("#btn_aviso_text").text("Aviso já enviado");
            $("#btn_aviso").toggleClass('bg-green bg-gray');
        }



        $("#btnComprovarNota").click(function () {
            util.add_path_to_breadcrumb('dados_checkin_nota.html');
            window.location = 'comprovar_nota.html';
        })

        screen.orientation.lock('portrait');

        $("#button_cancelar").on('click',  function (e) {

            navigator.notification.confirm('Deseja cancelar o checkin\nNota fiscal: ' + checkin_nota.num_nfe + '\nSérie: ' + checkin_nota.serie_nfe + '?',
                function (e) {
                    if (e == 1) {

                        //var user = window.localStorage.getItem("login");
                        var domain =  window.localStorage.getItem("domain");
                        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=CancelarCheckinNota';

                        $.ajax({
                            type: 'POST',
                            url: url,
                            data: JSON.stringify(checkin_nota),
                            dataType: "json",
                            headers: {
                                'apiKey': '78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547',
                            },
                            beforeSend: function () {
                                coreProgress.showPreloader(undefined, 0);
                            },
                            success: function (msg) {
                                coreDialog.close('.preloader');


                                if (msg.success == 'true' || msg.status == 'nota_inexistente') {
                                    window.localStorage.removeItem("dados_ultimo_checkin_nota");
                                    navigator.notification.alert("Cancelado com sucesso!", null, "Sucesso!", 'OK');
                                    util.return_last_page();
                                }else if(msg.status == 'nota_entregue')
                                {
                                    window.localStorage.removeItem("dados_ultimo_checkin_nota");
                                    navigator.notification.alert("Serviço já foi entregue!", null, "Sucesso!", 'OK');
                                    util.return_last_page();
                                } else {
                                    navigator.notification.alert('Houve um problema ao Cancelar: ' + msg.message, null, "Erro!", 'OK');
                                }
                            },
                            error: function (msg) {

                                coreDialog.close('.preloader');

                                var erro = '';
                                if(msg.responseJSON.message)
                                    erro = msg.responseJSON.message;
                                else
                                    erro = JSON.stringify(msg);
                                navigator.notification.alert(erro, null, "Erro!", 'OK');
                            }

                        });


                    }
                }, 'Confirmar Cancelamento', 'Sim,Não');



        });

    }

};
