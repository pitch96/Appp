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
        this.make_validations();

    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },


    make_validations: function(){

        var value = window.localStorage.getItem("is_logged");
        if (value == null || value == 'false')
            window.location = 'login.html';

        //verifica se existe algum checkin pendente de finalização armazenado no aparelho
        var checkin_nota = window.localStorage.getItem("dados_ultimo_checkin_nota");
        checkin_nota = JSON.parse(checkin_nota);
        if (checkin_nota != null && !checkin_nota.nao_travar_tela_checkin)
            window.location = 'dados_checkin_nota.html';


    },



    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {

        $(document).ready(function (e) {
            app.load_update_data();


            $("#btnCheckin").click(function () {
                util.add_path_to_breadcrumb('index.html');
                window.location = 'checkin_nota.html';
            });

            $("#btnComprovarNota").click(function () {
                console.log("Testssssssss");
                util.add_path_to_breadcrumb('index.html');
                window.location = 'comprovar_nota.html';
            });

            $("#btnNotasIniciadas").click(function () {
                console.log("Testssssssss");
                util.add_path_to_breadcrumb('index.html');
                window.location = 'notas_iniciadas_usuario.html';
            });

            $("#btnTransporteAgendado").click(function () {
                util.add_path_to_breadcrumb('index.html');
                window.location = 'index.html';
                // window.location = 'transporte_agendado.html';
            });

            $("#btnTransporteAgendado1").click(function () {
                console.log("Testssssssss");
                util.add_path_to_breadcrumb('index.html');
                window.location = 'transporte_agendado.html';
            });

            $("#btnRealizarColeta").click(function () {
                console.log("Testssssssss");
                util.add_path_to_breadcrumb('index.html');
                window.location = 'coleta_escolha.html';
            });


            $("#btnEmitirCTE").click(function () {
                util.add_path_to_breadcrumb('../index.html');
                window.location = 'cte/list_cte.html';
            });

            $("#alocaja").click(function () {
                util.add_path_to_breadcrumb('../index.html');
                window.location = 'alocaja/tela_online_alocaja.html';
            });
            $("#alocaJaHistorico").click(function () {
                util.add_path_to_breadcrumb('../index.html');
                window.location = 'alocaja/tela_filtro_historico_viagens_alocaja.html';
            });
        });
        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            util.return_last_page();
        }, false);
        util.getCurrentGeoLocation(
            function(s) {

                app.configureBackgroundGeoLocation();
                app.startBackgroundGeoLocation(); //inicia a coleta de dados de localização
            }, function(error) {
                console.log(error);
                /*
               navigator.notification.confirm('As permissões para uso do GPS não foram concedidas, alguns recursos podem não funcionar corretamente. ' + error,
                   function (e) {
                   }, 'Atenção', 'OK');*/
        });
        app.setupPush();
        var login  = window.localStorage.getItem("login");
        $("#usuario").text(login);


    },
    load_update_data: function(){
        const monthNames = ["01", "02", "03", "04", "05", "06",
            "07", "08", "09", "10", "11", "12"];
        let dateObj = new Date();
        let month = monthNames[dateObj.getMonth()];
        let day = String(dateObj.getDate()).padStart(2, '0');
        let day1 = String(dateObj.getDate()-1).padStart(2, '0');
        let day2 = String(dateObj.getDate()-2).padStart(2, '0');
        let year = dateObj.getFullYear();
        let output = day  + '/'+ month   + '/' + year;
        let output1 = day1  + '/'+ month   + '/' + year;
        let output2 = day2  + '/'+ month   + '/' + year;
        // $('#formDataShow').html('<p>'+output+'</p>');

        $('#finalizadaDate').text(output);
        $('#finalizadaDate1').text(output1);
        $('#finalizadaDate2').text(output2);

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.status == "ok") {
                $('#entregas').text(msg.data.number_purchases_pendent);
                $('#agendamentos').text(msg.data.number_transports_pendent);
                $('#finalizadas').text(msg.data.number_delivery_finished);
                $('#finalizadas1').text(msg.data.delivery_finished_daybefore);
                $('#finalizadas2').text(msg.data.delivery_finished_twodaysBefore);
                var config = {
                    value: msg.data.percent_complet,
                    text: '%',
                    durationAnimate: 3000,
                    padding: '3px',
                    color: 'white',
                    trailColor: 'black-opacity-10',
                    textSize: '50px',
                    textColor: 'black',
                    width:'160px',
                    height:'160px',
                    strokeWidth: '2',
                    trailWidth:'8',
                };
                ProgressCircle.create(document.getElementById('progressUserKM'), config);
            }
        }

        let error = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            $('.formDataShow').html('<p>error</p>');
        }

        var formData = new FormData();
        formData.append('username', window.localStorage.getItem("login"));

        webservice_access.get_update_data(formData, beforeSend, success, error);

    },
    setupPush: function() {
        console.log('calling push init');
        var push = PushNotification.init({
            "android": {
                "senderID": "12345"
            },
            "browser": {},
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });
        console.log('after init');

        push.on('registration', function(data) {
            console.log('registration event: ' + data.registrationId);

            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
            }

            var parentElement = document.getElementById('registration');
            var listeningElement = parentElement.querySelector('.waiting');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        push.on('notification', function(data) {
            console.log('notification event');
            navigator.notification.alert(
                data.message,         // message
                null,                 // callback
                data.title,           // title
                'Ok'                  // buttonName
            );
        });
    },


    startBackgroundGeoLocation: function() {

        //app.configureBackgroundGeoLocation();
        // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
        window.plugins.backgroundGeoLocation.start();
        // window.plugins.backgroundGeoLocation.delete_all_locations()

    },

    stopBackgroundGeoLocation: function() {
        // If you wish to turn OFF background-tracking, call the #stop method.
        window.plugins.backgroundGeoLocation.stop();

    },

    configureBackgroundGeoLocation: function() {
        // Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
        //  in order to prompt the user for Location permission.
        window.navigator.geolocation.getCurrentPosition(function(location) {
            console.log('Location from Cordova');
        });

        var bgGeo = window.plugins.backgroundGeoLocation;


        var yourAjaxCallback = function(response) {
            bgGeo.finish();
        };

        var callbackFn = function(location) {

            console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);
            yourAjaxCallback.call(this);
        };

        var failureFn = function(error) {
            console.log('BackgroundGeoLocation error');
        }

        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=InsertUserLocation';
        var user = window.localStorage.getItem("login");

        // BackgroundGeoLocation is highly configurable.
        bgGeo.configure(callbackFn, failureFn, {
            url: url,
            params: {
                user: user
            },
            headers: {
                'apiKey': '78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547'
            },
            desiredAccuracy: 0,
            stationaryRadius: 200,
            distanceFilter: 400,
            notificationTitle: 'Portal do Transportador',
            notificationText: 'Localização Ativa',
            activityType: "AutomotiveNavigation",
            debug: false,
            stopOnTerminate: true,
            persistLocation: false
        });


    }



};
