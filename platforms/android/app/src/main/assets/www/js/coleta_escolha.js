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
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },



    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
          var intervaloLocation = parseInt(window.localStorage.getItem("geo-loc-time"));
        intervaloLocation = intervaloLocation * 1000;
        setInterval(webservice_access.getLocationAndSendData, intervaloLocation);
        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);


        $("#btnVoltar").click(function () {
            util.return_last_page();
        });



        $("#btnNotaFiscal").click(function () {
            util.add_path_to_breadcrumb('../coleta_escolha.html');
            window.location = 'coletas/coleta_notafiscal.html';
        });

        $("#btnRemessa").click(function () {
            util.add_path_to_breadcrumb('../coleta_escolha.html');
            window.location = 'coletas/coleta_remessa.html';
        });

        $("#btnManifesto").click(function () {
            util.add_path_to_breadcrumb('../coleta_escolha.html');
            window.location = 'coletas/coleta_manifesto.html';
        });

        $("#btnPedidoVenda").click(function () {
            util.add_path_to_breadcrumb('../coleta_escolha.html');
            window.location = 'coletas/coleta_pedido.html';
        });
        
        $("#btnManifestoBipeRemessa").click(function () {
            util.add_path_to_breadcrumb('../coleta_escolha.html');
            window.location = 'coletas/coleta_manifesto_bipe_remessa.html';
        });


        let success = function (msg) {
            if (msg.success) {
                $('#myform')[0].reset();
                navigator.notification.alert("Coleta Realizada com Sucesso!", null, "Sucesso!", 'OK');
                $('#btnVoltar').click();
            } else {
                navigator.notification.alert("Houve um erro ao enviar, por favor tente novamente!", null, "Erro", 'OK');
            }
        }


        coleta_webservice_access.block_coleta_nf(null, function(result){
          try { if (result.success && result.message.toLowerCase() == 'x') {$("#btnNotaFiscal").removeAttr("disabled").removeClass("bg-gray").addClass("bg-blue");} }
          catch (e) {}
        }, null);

        coleta_webservice_access.block_coleta_remessa(null, function(result){
            try { if (result.success && result.message.toLowerCase() == 'x') {$("#btnRemessa").removeAttr("disabled").removeClass("bg-gray").addClass("bg-blue");} }
            catch (e) {}
        }, null);

        coleta_webservice_access.block_coleta_manifesto(null, function(result){
            try { if (result.success && result.message.toLowerCase() == 'x') {$("#btnManifesto").removeAttr("disabled").removeClass("bg-gray").addClass("bg-blue");} }
            catch (e) {}
        }, null);

        coleta_webservice_access.block_coleta_manifesto_bipe(null, function(result){
            try { if (result.success && result.message.toLowerCase() == 'x') {
                $("#btnManifestoBipeRemessa").removeAttr("disabled").removeClass("bg-gray").addClass("bg-blue");
               }
            }
            catch (e) {}
        }, null);



    },
};
