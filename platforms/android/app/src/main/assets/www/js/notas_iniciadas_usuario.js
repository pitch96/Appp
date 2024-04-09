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
            util.return_last_page();
        }, false);

        $(document).ready(function (e) {

            var intervaloLocation = parseInt(window.localStorage.getItem("geo-loc-time"));
            intervaloLocation = intervaloLocation * 1000;
            setInterval(webservice_access.getLocationAndSendData, intervaloLocation);
            app.loadNotas();

            screen.orientation.lock('portrait');

            window.localStorage.removeItem("dados_ultimo_checkin_nota");

            document.nfe_cache = window.localStorage.getItem("checkout_cache");
            if( document.nfe_cache != null &&  document.nfe_cache != '')
                document.nfe_cache = JSON.parse( document.nfe_cache);
            else
                document.nfe_cache = [];
            document.notas = [];
            $.each(document.nfe_cache, function (i, n) {
                n.is_cache = true;
                document.notas.push(n);
                console.log(n);
            });


            document.onClickGrid = function onClickGrid (e){
                var dados_nota = document.notas[e.id];
                //caso os dados da nota estejam salvos em cache, pergunta se usuário quer enviar os dados

                if((dados_nota.is_cache != null && dados_nota.is_cache)) {

                    navigator.notification.confirm('Deseja enviar os dados salvos desta NFE Agora?',
                        function (e) {

                            if (e == 1)
                            {
                                let checkout = dados_nota;
                                let form_data = new FormData();
                                for ( var key in checkout) {
                                    console.log(key);
                                    if(key == 'arquivo')
                                    {
                                        console.log('entrou em arquivo');
                                        console.log(checkout[key]);
                                        for(let i =0; i< checkout[key].length; i++) {
                                            console.log(checkout[key][i]);
                                            var blob = util.dataURItoBlob(checkout[key][i]);
                                            form_data.append('arquivo[]', blob, 'arquivo.jpg');
                                        }
                                    }
                                    else if(key == 'img_assinatura')
                                    {
                                        var blob = util.dataURItoBlob(checkout[key]);
                                        form_data.append('img_assinatura', blob, 'assinatura.png');
                                    }
                                    else
                                        form_data.append(key, checkout[key]);
                                }

                                var domain = window.localStorage.getItem("domain");
                                var url = domain + '/api/v1/nfe/enviarconfirmacaonota/post/';
                                $.ajax({
                                    type: 'POST',
                                    url: url,
                                    data: form_data,
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

                                        if (msg.success == 'true') {

                                            var checkout_cache = window.localStorage.getItem("checkout_cache");
                                            if(checkout_cache != null && checkout_cache != '')
                                                checkout_cache = JSON.parse(checkout_cache);
                                            else
                                                checkout_cache = [];

                                            checkout_cache = checkout_cache.filter(e => !(e.nfe == checkout.nfe && e.serie == checkout.serie && util.padLeft(e.cnpj, 14) == util.padLeft(checkout.cnpj, 14)));
                                            window.localStorage.setItem("checkout_cache", JSON.stringify(checkout_cache));

                                            navigator.notification.alert("Enviado com sucesso!", null, "Sucesso!", 'OK');
                                            window.location.reload(true);
                                        } else {
                                            navigator.notification.alert("Houve um problema ao enviar, por favor tente novamente: " + msg.message, null, "Erro!", 'OK');
                                        }

                                    },
                                    error: function (msg) {
                                        console.log(msg);
                                        coreDialog.close('.preloader');
                                        var erro = '';

                                        if(msg.readyState != null && msg.readyState == 0 )
                                            navigator.notification.alert("Não há internet suficiente para envio. Por favor verifique sua conexão.", null, "Atenção!", 'OK');
                                        else if(msg.statusText != null && (msg.statusText == 'timeout' || msg.statusText == 'Request Timeout'))
                                            navigator.notification.alert("Não foi possivel enviar a NFE agora, tente novamente mais tarde", null, "Atenção!", 'OK');
                                        else {
                                            if (msg.responseJSON != null && msg.responseJSON.message)
                                                erro = msg.responseJSON.message;
                                            else
                                                erro = JSON.stringify(msg);

                                            navigator.notification.alert("Atenção, houve um erro ao enviar a Nfe, por favor aguarde um momento e tente mais tarde." + erro, null, "Erro!", 'OK');
                                        }
                                    }

                                });

                            }
                        }, 'Enviar NFE', 'Sim,Cancelar');


                }else {
                    dados_nota.nao_travar_tela_checkin = true;
                    window.localStorage.setItem("dados_ultimo_checkin_nota", JSON.stringify(dados_nota));
                    var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");

                    util.add_path_to_breadcrumb('notas_iniciadas_usuario.html');
                    window.location = 'dados_checkin_nota.html';
                }
            }

            $("#btnNovo").click(function () {
                util.add_path_to_breadcrumb('notas_iniciadas_usuario.html');
                window.location = 'checkin_nota.html';
            })

            $("#btnVoltar").click(function () {
                util.return_last_page();
            })

        });
    },



    loadNotas: function(){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.success == 'true') {

                $.each(msg.notas, function (i, n) {
                    if(!app.nfe_exists_in_cache(n))
                        document.notas.push(n);
                });
            }

            app.load_notas_to_grid();
        }

        let error = function (msg) {
            app.load_notas_to_grid();
            coreDialog.close('.preloader');
            console.log(msg);
        }

        webservice_access.get_notas_iniciadas_by_user(beforeSend, success, error);

    },
    load_notas_to_grid: function(){
        $.each(document.notas, function (i, item) {

            var data_checkin =  moment(item.data_checkin).format('DD/MM/YYYY HH:mm');


            let row = "";
            if(item.is_cache != null && item.is_cache){
                row = '<li id="' + i + '" onclick="document.onClickGrid(this);" class="list-item with-second-label bg-red-50">' +
                    '<span class="label" id="nota">NF-E / OS: ' + item.nfe + ' Série: ' + item.serie  + ' (Envio Pendente)</span>' +
                    '<span class="second-label" id="data_hora">Data e Hora: ' + data_checkin + '</span></li>';
            }else{
                row = '<li id="' + i + '" onclick="document.onClickGrid(this);" class="list-item with-second-label ' +(i % 2 ? 'bg-gray-50' : '' ) + '">' +
                    '<span class="label" id="nota">NF-E / OS: ' + item.num_nfe + ' Série: ' + item.serie_nfe  + '</span>' +
                    '<span class="second-label" id="data_hora">Data e Hora: ' + data_checkin + '</span></li>';
            }
            $("#lista_notas").append(row);

        });
    },

    find_nfe_in_cache: function (nfe) {
        let arr = [];
        $.each(document.nfe_cache, function (v, checkout) {
            console.log(checkout);
            console.log(nfe);
            if(checkout.nfe == nfe.num_nfe && checkout.serie == nfe.serie_nfe && util.padLeft(checkout.cnpj, 14) == util.padLeft(nfe.cnpj, 14)){
                arr.push(checkout);

            }
        });
        return arr;
    },

    nfe_exists_in_cache: function (nfe) {
        return app.find_nfe_in_cache(nfe).length > 0;
    },



};
