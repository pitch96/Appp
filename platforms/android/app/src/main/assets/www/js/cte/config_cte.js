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



        $(document).ready(function (e) {
              var intervaloLocation = parseInt(window.localStorage.getItem("geo-loc-time"));
        intervaloLocation = intervaloLocation * 1000;
        setInterval(webservice_access.getLocationAndSendData, intervaloLocation);

            document.addEventListener("backbutton", function (e) {
                e.preventDefault();
                window.location = '../index.html';
            }, false);


            $("#btnVoltar").click(function () {
                window.location = '../index.html';
            })




            screen.orientation.lock('portrait');

            document.emitente_id = cte_configs.emitente_id();
            document.tpAmb = cte_configs.tpAmb();

            if(document.emitente_id <= 0)
            {
                navigator.notification.alert("O Uso do CTe ainda não foi habilitado", null, "Atenção!", 'OK');
                window.location = '../index.html';
                return;
            }

            app.load_dados_emitente_cte();
            app.load_status_sefaz_cte();

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

    load_status_sefaz_cte: function () {

        let success = function (msg) {
            if (msg.status == 'success') {
                 $("#status_sefaz").text((msg.data.status == 107 ? "Ativo" : "Inativo"));
            }
        }
        let data = {};
        data.emitente_id = document.emitente_id;
        data.tpAmb = document.tpAmb;
        cte_webservice_access.get_status_sefaz_cte(JSON.stringify(data), null, success, null);
    },

    load_dados_emitente_cte: function () {


        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.status == 'success') {

                if(msg.data.emitente == null || msg.data.emitente.xNome.length == 0) {
                    navigator.notification.alert("Os dados ainda não foram cadastrados", null, "Atenção!", 'OK');
                    window.location = '../index.html';
                    return;
                }

                document.dados_emitente_cte = msg.data;
                app.load_data_config_cte(msg.data);
                $("#tabs").css('display', 'block');
            }
            else{
                navigator.notification.alert(msg.message, null, "Erro!", 'OK');
                document.dados_emitente_cte = null;
            }
        }
        let error = function (msg) {
            coreDialog.close('.preloader');
            document.dados_emitente_cte = null;
            console.log(msg);
        }

        let data = {};
        data.emitente_id = document.emitente_id;
        data.tpAmb = document.tpAmb;
        //console.log(data);
        cte_webservice_access.get_dados_emissor_cte(JSON.stringify(data), beforeSend, success, error);
    },



    load_data_config_cte: function (data) {



        $("#razao_social").text(data.emitente.xNome);
        $("#nome_fantasia").text(data.emitente.xFant);
        $("#cnpj").text(data.emitente.xMun);
        $("#inscricao_estadual").text(data.emitente.ie);
        $("#uf").text(data.emitente.uf);


        $("#nome_certificado").text(data.certificado.CN);
        $("#tipo_certificado").text(data.certificado.tipo);
        $("#validade_certificado").text(data.certificado.validade);
        $("#token_certificado").text(data.certificado.serial_number);




        $("#pis").text(data.aliquotaPIS + (data.PIS_ATIVO ? " (ATIVO)" : " (INATIVO)"));
        $("#cofins").text(data.aliquotaCOFINS + (data.COFINS_ATIVO ? " (ATIVO)" : " (INATIVO)"));
        $("#icms").text(data.aliquotaICMS + (data.ICMS_ATIVO ? " (ATIVO)" : " (INATIVO)"));
        $("#simples").text(data.aliquotaSIMPLES + (data.SIMPLES_ATIVO ? " (ATIVO)" : " (INATIVO)"));

        $("#CFOP").text(data.cfop_auto.cfop_cod + ' - ' + data.cfop_auto.cfop_desc);

        $.each(data.centros, function (i, item) {
            $("#centros").append(new Option(item.nome_centro, item.cnpj));
        });

        $("#numeracao_inicial").text(data.range.nIni);
        $("#numeracao_final").text(data.range.nfin);
        $("#numeracao_sequencial").text(data.range.contadoratual);
        $("#numeracao_serie").text(data.range.serie);


    }




};
