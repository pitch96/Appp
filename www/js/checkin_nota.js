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



    setCurrentLocationOnMap: function(location) {

        var mapOptions = {
           // center: { lat: -34.397, lng: 150.644},
            zoom: 8,
            zoomControl: false,
            mapTypeControl: false
        };

        var canvas = $('#map-canvas');
        app.map = new google.maps.Map(canvas[0], mapOptions);

        var fgGeo = window.navigator.geolocation;
        fgGeo.getCurrentPosition(function(location) {
            var map     = app.map,
                coords  = location.coords,
                ll      = new google.maps.LatLng(coords.latitude, coords.longitude),
                zoom    = map.getZoom();

            map.setCenter(ll);
            if (zoom < 15) {
                map.setZoom(15);
            }

            app.location = new google.maps.Marker({
                map: app.map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 3,
                    fillColor: 'blue',
                    strokeColor: 'blue',
                    strokeWeight: 5
                },
                position: new google.maps.LatLng(coords.latitude, coords.longitude)
            });


        });


    },





    onDeviceReady: function () {

        document.addEventListener("backbutton", function () {
            util.return_last_page();
        }, false);

        $(document).ready(function (e) {
            var intervaloLocation = parseInt(window.localStorage.getItem("geo-loc-time"));
            intervaloLocation = intervaloLocation * 1000;
            setInterval(webservice_access.getLocationAndSendData, intervaloLocation);
            util.getCurrentGeoLocation();
            app.setCurrentLocationOnMap();

            app.loadCentros();

            screen.orientation.lock('portrait');



            app.loadAjaxMethods();
            app.initQuagga();

            $("#btnVoltar").click(function () {
                util.return_last_page();
            })


        });

    },

    loadAjaxMethods : function(){

        $("#myform").on('submit',  function (e) {

            e.preventDefault();
            var user = window.localStorage.getItem("login");
            var domain =  window.localStorage.getItem("domain");

            var formData = new FormData(this);
            formData.append('user', user);

            var latitude = '', longitude = '';
            if(document.current_position != null){
                latitude = document.current_position.coords.latitude;
                longitude = document.current_position.coords.longitude;
            }

            formData.append('latitude', latitude);
            formData.append('longitude',longitude);
            formData.append('nfe_key', document.nfe_key != null ? document.nfe_key : '');

            var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=CheckInNota';

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
                        console.log('checkinnota_set_item_2');
                        window.localStorage.setItem("dados_ultimo_checkin_nota", JSON.stringify(msg.dados_nfe));
                        console.log('checkinnota_fezcheckin',JSON.stringify(msg.dados_nfe));
                        navigator.notification.alert("Inicio de transporte realizado com sucesso!!", null, "Sucesso!", 'OK');
                        $('#btnVoltar').click();

                    } else if(msg.dados_nfe != null)
                    {
                    console.log('checkinnota_set_item_3');
                        window.localStorage.setItem("dados_ultimo_checkin_nota", JSON.stringify(msg.dados_nfe));
                        navigator.notification.alert(msg.message, null, "Atenção!", 'OK');

                        $('#btnVoltar').click();

                    } else {
                        $('.statusMsg').html('<span class="fg-red">Houve um problema ao salvar os dados, por favor tente novamente: ' + msg.message + '</span>');
                    }
                },
                error: function (msg) {
                    coreDialog.close('.preloader');

                    $('#myform').css("opacity", "");
                    $(".submitBtn").removeAttr("disabled");
                    $("#myform").removeAttr("disabled");

                    var erro = '';
                    if(msg.responseJSON.message)
                        erro = msg.responseJSON.message;
                    else
                        erro = JSON.stringify(msg);
                    navigator.notification.alert(erro, null, "Erro!", 'OK');
                    console.log(msg);

                    $('.statusMsg').html('<span class="fg-red">Houve um problema ao salvar, por favor tente novamente:' + erro + '</span>');

                }

            });


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
            }

        }

        let error = function (msg) {
            app.load_centros_options();
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






};
