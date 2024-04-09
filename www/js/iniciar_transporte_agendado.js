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


        $(document).ready(function () {

            coreProgress.showPreloader(undefined, 0);
            util.getCurrentGeoLocation(function (position) {
                document.current_position = position;
                console.log(document.current_position);

                app.load_notas_transporte_agendado();


                screen.orientation.lock('portrait');
                var transporte  = JSON.parse(window.localStorage.getItem("transporte"));
                $("#codigo").html(transporte.codigo);
                $("#centro").html(transporte.centro);
                $("#cnpj").html(transporte.cnpj);

                $("#btnVoltar").click(function () {
                    util.return_last_page();
                })


                $("#btnIniciarTransporte").click(function () {
                    navigator.notification.confirm('Você deseja iniciar este transporte agendado?',
                        function (e) {
                            if (e == 1) {
                                var transporte =  JSON.parse(window.localStorage.getItem("transporte"));
                                app.iniciar_transporte_agendado(transporte.transporte_id);

                            }
                        }, 'Confirmar Inicio do Transporte', 'SIM,Cancelar');
                })

                coreDialog.close('.preloader');
            }, function (error) {
                coreDialog.close('.preloader');
                console.log(error);
            });

        });
    },


    iniciar_transporte_agendado: function(transporte_id){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.success == 'true') {
                navigator.notification.alert("Transporte Agendado iniciado com sucesso!!", null, "Sucesso!", 'OK');

                //redirecionado para a pagina de notas iniciadas, e alterando o caminho que o usuario percorreu
                var breadcrumb = [{"url" : "index.html"}];
                util.save_breadcrumb(breadcrumb);
                window.location = 'notas_iniciadas_usuario.html';
            }else{
                navigator.notification.alert(msg.message, null, "Atenção!", 'OK');
                $('#btnVoltar').click();
            }

        }

        let error = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
        }

        var formData = new FormData();

        formData.append('transporte', transporte_id);

        var latitude = '', longitude = '';
        if(document.current_position != null){
            latitude = document.current_position.coords.latitude;
            longitude = document.current_position.coords.longitude;
        }

        formData.append('latitude', latitude);
        formData.append('longitude',longitude);
        formData.append('usuario', window.localStorage.getItem("login"));
        webservice_access.iniciar_transporte_agendado(formData, beforeSend, success, error);

    },

    load_notas_transporte_agendado: function(){

        var transporte =  JSON.parse(window.localStorage.getItem("transporte"));
        document.notas = transporte.notas;

        $.each(document.notas, function (i, item) {

            var data_checkin =  moment(item.data_checkin).format('DD/MM/YYYY');

            let row = '<li id="' + i + '" onclick="document.onClickGrid(this);" class="list-item with-second-label ' +(i % 2 ? 'bg-gray-50' : '' ) + '">' +
                '<span class="label" id="data_hora">Data: ' + data_checkin + '</span>' +
                '<span class="second-label" id="nota">NF-E: ' + item.num_nfe + ' Série: ' + item.serie_nfe  + '</span></li>';
            $("#lista_notas").append(row);
        });

    },

};
