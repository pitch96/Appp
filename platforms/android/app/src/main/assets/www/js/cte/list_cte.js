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
              var intervaloLocation = parseInt(window.localStorage.getItem("geo-loc-time"));
        intervaloLocation = intervaloLocation * 1000;
        setInterval(webservice_access.getLocationAndSendData, intervaloLocation);

            window.localStorage.removeItem("current_cte");
            if(cte_configs.emitente_id() > 0 && cte_configs.usuario_acessa_cte())
                app.loadCtes();
            else{

                $("#btnNovo").css("display", "none");
                $("#message_cte").css("display", "block");
                if(cte_configs.emitente_id() > 0 && !cte_configs.usuario_acessa_cte())
                    $("#message_cte").html("CTE não está Habilitado para este usuário.");
                else
                    $("#message_cte").html("CTE não está Habilitado para está transportadora.");
            }

            screen.orientation.lock('portrait');

            document.onClickGrid = function onClickGrid (e){
                var cte = document.ctes[e.id];
                    window.localStorage.setItem("current_cte", JSON.stringify(cte));
                    util.add_path_to_breadcrumb('list_cte.html');
                    window.location = 'emitir_cte.html';
                }

            $("#btnNovo").click(function () {
                util.add_path_to_breadcrumb('list_cte.html');
                window.location = 'emitir_cte.html';
                window.localStorage.setItem("current_cte", "");
            })

            $("#btnVoltar").click(function () {
                util.return_last_page();
            })

        });
    },



    loadCtes: function(){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.success) {
                document.ctes = msg.ctes;
                app.load_ctes_to_grid();
            }
        }

        let error = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
        }

        var login  = window.localStorage.getItem("login");
        let data = {"emitente_id" : cte_configs.emitente_id(), "tpAmb" : 2, "usuario_emissao" : login, "limit" : 30};
        cte_webservice_access.get_lista_cte(data, beforeSend, success, error);

    },

    load_ctes_to_grid: function(){
        $.each(document.ctes, function (i, item) {
            var data_criacao =  moment(item.data_criacao).format('DD/MM/YYYY HH:mm');
            let icon = "";
            if(item.status == 7)
                icon = "fa-2x fa fa-check-circle fg-green-300";
            else if(item.status == 6)
                icon = "fa-2x fa fa-exclamation-triangle fg-yellow-300";
            else
                icon = "fa-2x fa fa-exclamation-triangle fg-red-300";

            let row  =
                '<li id="' + i + '" onclick="document.onClickGrid(this);"  class="list-item with-second-label ' +(i % 2 ? 'bg-gray-50' : '' ) + '">' +
                '<div class="row"><div class="margin-right1"><span  class="' + icon + '"></span></div>' +
                '<div class="cell"><span class="label" id="nota">CT-E: ' + item.cte_num + ' Série: ' + item.serie  + '</span>' +
                '<span class="second-label" id="data_hora">Data e Hora: ' + data_criacao + '</span>' +
                '<span class="second-label" >Destinatário: ' + item.dest_xNome + '</span></div></div></li>';

            $("#lista_ctes").append(row);

        });
    },




};
