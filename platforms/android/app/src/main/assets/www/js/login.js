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

    getIsDebug:  function () {
        var is_debug = true;
        var domain = '';
         cordova.plugins.IsDebug.getIsDebug(function (isDebug) {
            is_debug = isDebug;
            window.localStorage.setItem("is_debug", isDebug);

           
           //     domain = 'https://qa.portaldotransportador.com';
           domain = 'https://prd.portaldotransportador.com';
            window.localStorage.setItem("domain", domain);

        }, function (err) {
            console.error(err);
        });

    },
    setupPermissions: function() {

        var permissions = cordova.plugins.permissions;
        var list = [
            permissions.CAMERA,
            permissions.GET_ACCOUNTS,
            permissions.READ_EXTERNAL_STORAGE,
            permissions.WRITE_EXTERNAL_STORAGE,
            permissions.ACCESS_FINE_LOCATION,
            permissions.FOREGROUND_SERVICE

        ];

        permissions.checkPermission(list, success, error);


        function success(status) {
            if (!status.hasPermission) {

                permissions.requestPermissions(
                    list,
                    function (status) {
                        if (!status.hasPermission) error();
                    },
                    error);
            }
        }

        function error() {
            console.warn('Camera permission is not turned on');
        }
    },

    onDeviceReady: function () {

        app.setupPermissions();
        app.getIsDebug();
        window.open = cordova.InAppBrowser.open;

        var value = window.localStorage.getItem("is_logged");
        if (value == 'true')
            window.location = 'index.html';

        screen.orientation.lock('portrait');

        $(document).ready(function(e){

            var domain = window.localStorage.getItem("domain");
            var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=Login';
        $("#login_form").on('submit', function(e){
                e.preventDefault();
                $.ajax({
                    type: 'POST',
                    url: url,
                    data: new FormData(this),
                    contentType: false,
                    cache: false,
                    processData:false,
                    headers: {
                        'apiKey':'78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547',
                    },
                    beforeSend: function(){
                        $('.submitBtn').attr("disabled","disabled");
                        $('#myform').css("opacity",".5");
                        $('#myform').attr("disabled","disabled");
                        coreProgress.showPreloader(undefined, 0);
                    },
                    success: function(response){
                        coreDialog.close('.preloader');
                        $('.statusMsg').html('');
                        if(response.login_is_valid == 'true'){
                            window.localStorage.setItem("is_logged", 'true');
                            window.localStorage.setItem("login", response.login);
                            window.localStorage.setItem("acesso_cte_id", response.acesso_cte_id);
                            window.localStorage.setItem("acesso_cte", response.acesso_cte);
                            window.localStorage.setItem("user_id", response.user_id);
                            console.log("response.geoLocActive", response.geoLocActive);
                            if (response.geoLocActive.length > 0){
                                window.localStorage.setItem("geo-loc-active", response.geoLocActive);
                            } else {
                               window.localStorage.setItem("geo-loc-active", "0");
                            }

                            console.log('RESPONSEEEEEEE,', JSON.stringify(response));
                            console.log('geoLocTime,', response.geoLocTime);
                              if (response.geoLocActive.length > 0){
                              console.log('entrou aqui');
                                window.localStorage.setItem("geo-loc-time", response.geoLocTime);
                            } else {
                            console.log('entrou aqui');
                               window.localStorage.setItem("geo-loc-time", "5");
                            }


                            window.location = 'index.html';
                        }else{
                            $('.statusMsg').html('<span class="fg-red">Houve um problema ao enviar, por favor tente novamente</span>');
                        }
                        $('#myform').css("opacity","");
                        $(".submitBtn").removeAttr("disabled");
                        $("#myform").removeAttr("disabled");
                    },
                    error: function(msg) {

                        var erro = '';
                        if(msg.responseJSON.message)
                            erro = msg.responseJSON.message;
                        else
                            erro = JSON.stringify(msg);

                        coreDialog.close('.preloader');
                        $('.statusMsg').html('<span class="fg-red">' + erro + '</span>');
                    }

                });
            });
        });

    }
};
