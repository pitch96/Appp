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

        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);

               $(document).ready(function (e) {
                   app.loadCentros();

                   app.load_transportes_agendados();

                   screen.orientation.lock('portrait');


                /*   document.onClickGrid = function onClickGrid (e){
                      console.log("legal pra caraaaai")
                console.log(JSON.stringify(e))
                   }
*/

                   $("#btnVoltar").click(function () {
                       util.return_last_page();
                    })

               });
        $("#btnVoltar").click(function () {
            util.return_last_page();
        });

        $("#btnIniciar").click(function () {
            util.showServiceMessage('Código de Barras', 'Código Inválido. Por favor tente novamente');

        });
  $("#btnFiltrar").click(function () {
         util.add_path_to_breadcrumb('tela_filtro_historico_viagens_alocaja.html');

            window.location = 'tela_historico_viagens_alocaja.html';
        });

      $("#btnVerTodasViagens").click(function () {
         util.add_path_to_breadcrumb('tela_filtro_historico_viagens_alocaja.html');
      window.localStorage.removeItem("filter_alocaja_cnpj_historico");
         window.localStorage.removeItem("filter_alocaja_status_historico");
         window.location = 'tela_historico_viagens_alocaja.html';
        });
        $("#cnpj").change(function (e) {
               console.log("valores cnpj")
               console.log(Number(e.target.value))
        window.localStorage.setItem("filter_alocaja_cnpj_historico", Number(e.target.value));

        });
        $("#status").append(new Option("Em Transito", "Em Transito"));
        $("#status").append(new Option("Finalizado", "Finalizado"));
            $("#status").append(new Option("Aguardando Inicio Transporte", "Aguardando Inicio Transporte"));


        $("#status").change(function (e) {
           console.log(e.target.value)
           window.localStorage.setItem("filter_alocaja_status_historico", e.target.value);

         });
        $("#btnTesteChamada").click(function () {
            app.showServiceMessage('Novo Serviço', 'Aceitar serviço?');

        });
        document.entregas =[];
        app.load_entregas();
        let cont = 1;





        cordova.plugins.notification.local.on("click", function (notification) {
            alert('ok');
        });

    },

    onClickGrid: function (i){
    console.log("entrou no on click grid")
    var transporteEscolhido = document.entregas[i];
        console.log(JSON.stringify(transporteEscolhido));



    var pesoTotal=0;
    var tamanho = 0;

    var notas=[];
    var n;


     $.each(transporteEscolhido, function (i, item) {
     if (i< tamanho){
      n = {
       	transporte_id : transporteEscolhido[0].codigo,
       	num_nfe : transporteEscolhido[i].nota,
       	serie_nfe : transporteEscolhido[i].serie,
       	user : window.localStorage.getItem("login"),
       	cnpj : transporteEscolhido[i].cnpj_centro,
       	endereco: `${transporteEscolhido[i].endereco_cliente}, ${transporteEscolhido[i].endereco_numero} - ${transporteEscolhido[i].bairro_cliente} - ${transporteEscolhido[i].cidade_cliente}, CEP: ${transporteEscolhido[i].cep_cliente} `

       }
       notas.push(n);
}
      });
      console.log("notas");
      console.log(JSON.stringify(notas))
    var transp = {
    	transporte_id : transporteEscolhido[0].id,
    	codigo : transporteEscolhido[0].codigo,
    	endereco_centro: transporteEscolhido[0].endereco_centro,
    	centro : transporteEscolhido[0].nome_centro,
    	preco: "R$23,00",
    	pesoMaximo: pesoTotal,
    	cnpj : transporteEscolhido[0].cnpj_centro,
    
    	user : window.localStorage.getItem("login"),
    	notas : notas
    }
        console.log("Chamando entrega agendada tela ")
        console.log(JSON.stringify(transp));

        window.localStorage.setItem("transporte", JSON.stringify(transp));
            util.add_path_to_breadcrumb('tela_historico_viagens_alocaja.html');
            window.location = '../alocaja/iniciar_transporte_dinamico.html';
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
                    let row = '<li id="' + i + '" onclick="app.onClickGrid(this);" class="list-item with-second-label ' +(i % 2 ? 'bg-gray-50' : '' ) + '">' +
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
            console.log("SUCESSO FUNCTION ATIVADA")
            console.log(entregas);
            var obj = JSON.parse(entregas)
            console.log(JSON.stringify(entregas))
            if (obj.data.length == 0){
            console.log("aqui tem zero parça")

            } else{

            $.each(obj.data, function (i, n) {


                document.entregas.push(n);

            });
            }
            app.load_entregas_to_grid();
        }

        let error = function (msg) {
        console.log("ERROR FUNCTION ATIVADO")
            app.load_entregas_to_grid();
            coreDialog.close('.preloader');
            console.log(msg);
        }


        alocaja_webservice_access.get_historico(beforeSend, success, error);

    },

    load_entregas_to_grid: function(){
                    var myobj = document.getElementById("lista_entregas");

                myobj.style.display = '';


    if (document.entregas.length == 0){

            document.getElementById("pResultadosEncontrados").innerHTML = "0 resultados encontrados."
    } else {
            document.getElementById("pResultadosEncontrados").innerHTML = `${document.entregas.length} resultados encontrados.`

        $.each(document.entregas, function (i, item) {

         console.log("quantidade de notas");


            var destino = "destino";
            var quantidadeDestinos=0;
            var pesoTotal=0;
             $.each(item, function (i, item2) {

                quantidadeDestinos++;
             })

             var quantidadeNotas = quantidadeDestinos -3;



            console.log("ENTREGA NUMERO", i);

            console.log(JSON.stringify(item))

/*
            item.notas.length > 0 ? `${item.notas[0].bairro_cliente}, ${item.notas[0].cidade_cliente}` : '';
*/
            let row = `<li id="${i}" onclick="app.onClickGrid(${i});"  class="list-item with-second-label ${(i % 2 ? 'bg-gray-50' : '')}">` +
                            `<div class="row">` +
                                    `<div class="cell" style="min-width: 70px;"><span  class="fa-2x fa fa-truck-moving ${item.isDinamico =="1" ? "fg-purple-300": "fg-purple-100"} "></span></div>` +
                                    `<div class="cell">` +
                                        `<div class="row"><div class="cell"><span class="label" id="nota">Status: ${item.status}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="second-label" id="data_hora">${item.isDinamico =="1" ? "Dinâmico": "false"}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="second-label" id="data_hora">Data Criação: ${item.data_criado}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="second-label" id="data_hora">${item.data_finalizado != null ? `Data Finalização ${item.data_finalizado}` : "Não Finalizado"}</span></div></div>` +
                                        `<div class="row"><div class="cell"><span class="second-label" id="data_hora">Preço: R$ ${item.valor_oferecido}</span></div></div>` +


                                    `</div>` +
                             `</div>` +
                        `</li>`;

            $("#lista_entregas").append(row);

        });
        }
    },

  loadCentros: function(){
        console.log("loadCentros")

        let beforeSend = function () {
/*
            coreProgress.showPreloader(undefined, 0);
*/
        }

        let success = function (msg) {
         console.log(JSON.stringify(msg))

            coreDialog.close('.preloader');
            if (msg.success == 'true') {
                app.load_centros_options(msg.centros);

            }
        }

        let error = function (msg) {
                console.log("error")
        console.log(JSON.stringify(msg))


            coreDialog.close('.preloader');
            console.log(msg);
        }


        webservice_access.get_centros(beforeSend, success, error);

    },
    load_centros_options : function(centros){
    console.log("cada centro load_centros_options")
        $.each(centros, function (i, item) {
            $("#cnpj").append(new Option(item.nome_centro, item.cnpj));
        });
    },
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
