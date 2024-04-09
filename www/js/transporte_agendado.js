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


        $(document).ready(function (e) {

            app.load_transportes_agendados();

            screen.orientation.lock('portrait');


            document.onClickGrid = function onClickGrid (e){
                var transporte = document.transportes_agendados[e.id];
                app.open_transporte_agendado(transporte.transporte_id);

            }


            $("#btnVoltar").click(function () {
                util.return_last_page();
             })

        });
    },




    load_transportes_agendados: function(){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.status == 1) {
                document.transportes_agendados = msg.transporte;

                $.each(document.transportes_agendados, function (i, item) {
                    let row = '<li id="' + i + '" onclick="document.onClickGrid(this);" class="list-item with-second-label ' +(i % 2 ? 'bg-gray-50' : '' ) + '">' +
                              '<span class="label" id="codigo">Transporte: ' + item.codigo + '</span>' +
                              '<span class="second-label" id="transporte">Centro: ' + item.centro + '</span></li>';
                                $("#lista_transporte_agendado").append(row);
                            });
            }
        }

        let error = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
        }

        webservice_access.get_list_transportes_agendados(beforeSend, success, error);

    },


    open_transporte_agendado: function(transporte_id){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.status == 1) {
                window.localStorage.setItem("transporte", JSON.stringify(msg.transporte));
                window.localStorage.setItem("tela_origem", "transporte_agendado.html");
                window.location = 'iniciar_transporte_agendado.html';
            }
            else
                navigator.notification.alert(msg.mensagem, null, "Atenção!", 'OK');
        }

        let error = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            navigator.notification.alert(msg.responseJSON.mensagem, null, "Atenção!", 'OK');
        }

        var formData = new FormData();
        formData.append('transporte', transporte_id);
        formData.append('usuario', window.localStorage.getItem("login"));
        webservice_access.get_transporte_agendado(formData, beforeSend, success, error);

    },


};
