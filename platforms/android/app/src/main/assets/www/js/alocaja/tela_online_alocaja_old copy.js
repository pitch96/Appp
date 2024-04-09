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
    closeServiceTimeout: null,
    audioSkype: null,

    // Application Constructor
    initialize: function () {
        this.bindEvents();
        app.audioSkype = new Audio('../assets/audio/skype_call.mp3');
        app.audioSkype.loop = true;
    },

    get_api_path: function(){
         var domain = window.localStorage.getItem("domain")
        return `${domain}`;
    },


    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },


    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
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
        $("#btnFicarOnline").click(function () {

            //Add Token Here
            window.FirebasePlugin.getToken(function(token) {
                // save this server-side and use it to push notifications to this device
                console.log(token);
                localStorage.setItem("fcm_token", token);
                if (document.getElementById("btnFicarOnline").innerHTML == 'Ficar ONLINE'){
                    app.set_status("ONLINE");
                 } else {
                    app.set_status("OFFLINE");
                 }
            }, function(error) {
                console.error('fcm get token error');
                console.error(error);
            });
        });
        $("#btnFicarOffline").click(function () {
               app.set_status("OFFLINE")
        });

        $("#btnVerEntregas").click(function () {
            util.add_path_to_breadcrumb('tela_online_alocaja.html');
            window.location = 'tela_filtro_viagens_abertas_alocaja.html';
        });
        $("#btnTesteChamada").click(function () {
            app.showServiceMessage('Novo Serviço', 'Aceitar serviço?');
        });

        document.entregas =[];
        app.load_entregas();
        let cont = 1;

        var statusHistorico = window.localStorage.getItem("is_Online_Dinamico");
        app.alterarBotaoStatus(statusHistorico)

      /* setInterval(function () {
           cordova.plugins.notification.local.schedule({
               id: cont++,
               title: 'My first notification' + cont,
               text: 'Thats pretty easy...' + cont,
               foreground: true,
               badge: 1,
           });
        }, 5000);*/




        cordova.plugins.notification.local.on("click", function (notification) {
            alert('ok');
        });

    },

    set_status: function (status) {
        var user1 = window.localStorage.getItem("login");
        var url =  this.get_api_path() + `/externo/api/ws/Alocaja/set_status_motorista`;
        var fgGeo = window.navigator.geolocation;
        var coords;
        fgGeo.getCurrentPosition(function(location) {
             var form = new FormData();
                form.append("user_id", `"${user1}"`);
   form.append("latitude", location.coords.latitude);
   form.append("longitude", location.coords.longitude);
   form.append("status", status);
   

   token = localStorage.getItem("fcm_token")
   console.log('Sending token:' + token);
   form.append("itoken", token);

   var settings = {
     "url": url,
     "method": "POST",
     "timeout": 0,
     "headers": {
       "apiKey": "78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547",
     },
     "processData": false,
     "mimeType": "multipart/form-data",
     "contentType": false,
     "data": form
   };

   $.ajax(settings).done(function (response) {
       var obj = JSON.parse(response);
             if (obj.success === true){
                app.alterarBotaoStatus(status)
             navigator.notification.alert(status == "ONLINE"? "Você está recebendo novos fretes.": "Você não está mais recebendo novos fretes.")
             } else {
             navigator.notification.alert("Erro na operação! Favor tente novamente!")
             }
       });
   });
    },



    showServiceMessage: function (title = '', message = '') {

        app.setLocationOnMap("Rua Capitão Pacheco e Chaves, 313 - Mooca, São Paulo");
        coreDialog.open('#dialogProcessMessage');
        $('#process-message-title').html(title);
        $('#process-message-text').html(message);
        $('#origem-text').html("Origem: Mooca-SP");
        $('#destino-text').html("Destino: Freguesia do Ó-SP");
        $('#valor-text').html("Valor da corrida: R$ 560,00");


        $('#process-message').attr('src', '../img/process-success.gif');
        app.playRingingAudio();
        app.closeServiceTimeout = setTimeout(function () {
            app.closeServiceCallScreen();
        }, 30000);
        app.closeServiceTimeout();
    },


    alterarBotaoStatus: function (status) {

     document.getElementById("btnFicarOnline").classList.add("bg-red")
     document.getElementById("btnFicarOnline").innerHTML = status == "ONLINE" ? 'Ficar OFFLINE' : 'Ficar ONLINE';
     document.getElementById("pMensagemStatus").innerHTML = status == "ONLINE" ? 'Você esta recebendo viagens dinâmicas.' : 'Você não esta recebendo viagens dinâmicas.';

    if (status == "ONLINE"){
         window.localStorage.setItem("is_Online_Dinamico", 'ONLINE');

        document.getElementById("btnFicarOnline").classList.remove("bg-green")
        document.getElementById("btnFicarOnline").classList.add("bg-red")


      } else{
           window.localStorage.setItem("is_Online_Dinamico", 'OFFLINE');

        document.getElementById("btnFicarOnline").classList.remove("bg-red")
        document.getElementById("btnFicarOnline").classList.add("bg-green")
      }


    },


    ficarOnline: function (title = '', message = '') {

        app.setLocationOnMap("Rua Capitão Pacheco e Chaves, 313 - Mooca, São Paulo");
        coreDialog.open('#dialogProcessMessage');
        $('#process-message-title').html(title);
        $('#process-message-text').html(message);
        $('#origem-text').html("Origem: Mooca-SP");
        $('#destino-text').html("Destino: Freguesia do Ó-SP");
        $('#valor-text').html("Valor da corrida: R$ 560,00");


        $('#process-message').attr('src', '../img/process-success.gif');
        app.playRingingAudio();
        app.closeServiceTimeout = setTimeout(function () {
            app.closeServiceCallScreen();
        }, 30000);
        app.closeServiceTimeout();
    },

    closeServiceCallScreen: async function () {
        clearTimeout(app.closeServiceTimeout);
        app.stopRingingAudio();
        coreDialog.close('#dialogProcessMessage');
    },

    acceptService: function () {
        clearTimeout(app.closeServiceTimeout);
        app.stopRingingAudio();
        coreDialog.close('#dialogProcessMessage');

    },

    playRingingAudio: function() {
        app.audioSkype.play();
    },
    stopRingingAudio: async function() {
        app.audioSkype.currentTime = 0;
        await app.audioSkype.pause();
    },


    load_entregas: function(){

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (entregas) {
            coreDialog.close('.preloader');
            $.each(entregas, function (i, n) {
                 document.entregas.push(n);
            });
/*
            app.load_entregas_to_grid();
*/
        }

        let error = function (msg) {
/*
            app.load_entregas_to_grid();
*/
            coreDialog.close('.preloader');
            console.log(msg);
        }


    },






/*

    load_entregas_to_grid: function(){

        console.log(document.entregas);
        $.each(document.entregas, function (i, item) {

            //var data_criacao_entrega =  moment(item.dataCriacaoEntrega).format('DD/MM/YYYY HH:mm');
            var destino = item.notas.length > 0 ? `${item.notas[0].bairro_cliente}, ${item.notas[0].cidade_cliente}` : '';
            let row = `<li id="${i}" onclick="document.onClickGrid(this);"  class="list-item with-second-label ${(i % 2 ? 'bg-gray-50' : '')}">` +
                            `<div class="row">` +
                                    `<div class="cell" style="min-width: 70px;"><span  class="fa-2x fa fa-truck-moving fg-purple-300"></span></div>` +
                                    `<div class="cell">` +
                                        `<div class="row"><div class="cell"><span class="label" id="nota">Destino: ${destino}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="second-label" id="data_hora">Data e Hora: ${item.dataCriacaoEntrega}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="label" id="nota">Valor Corrida: ${item.valorCorrida}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="label" id="nota">Previsão KM: ${item.previsaoKilometragem}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="second-label" id="data_hora">${item.statusEntrega}</span></div></div>` +
                                    `</div>` +
                             `</div>` +
                        `</li>`;

            $("#lista_entregas").append(row);

        });
    },

*/

    setLocationOnMap: function(address) {


        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var myOptions = {
                    zoom: 15,
                    zoomControl: false,
                    mapTypeControl: false,
                    center: results[0].geometry.location,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }
                let map = new google.maps.Map($('#map-canvas')[0], myOptions);


                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 3,
                        fillColor: 'blue',
                        strokeColor: 'blue',
                        strokeWeight: 5
                    },
                });
            }
        });
    },

};
