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

            app.check_list_buttons();
            document.notas = [];
            document.refresh_resumo_cte = false;


            document.addEventListener("backbutton", function (e) {
                e.preventDefault();
                //util.return_last_page();
            }, false);

            $("#btnVoltar").click(function () {
                util.return_last_page();
            });

            $("#button_scanner").click(function () {
                app.loadBarcode();
            });

            util.getCurrentGeoLocation();

            app.loadCentros();




            $(".tab").click(function () {
                (this.id == 'tab_dados_nfe') ? $("#btnNovo").show() : $("#btnNovo").hide();

                console.log(document.refresh_resumo_cte);
                if(this.id == "tab_resumo_cte" && document.refresh_resumo_cte)
                    app.load_resumo_cte();
            })


            document.onClickGrid = function onClickGrid (e) {
                var nfe = document.notas[e.id];
                navigator.notification.confirm('Deseja remover a NFE Nº:' + nfe.num_nfe + ', Série:' + nfe.serie_nfe + ' da Lista?',
                    function (idx) {
                        if (idx == 1) {
                            delete document.notas[e.id];
                            $('#yourlist #yourli').remove()
                            $('#lista_notas #' + e.id).remove();
                            document.refresh_resumo_cte = true;
                            console.log(document.notas);
                        }
                    }, 'Excluir');
            }


            screen.orientation.lock('portrait');



            $("#btnEmitirCTE").click(function () {


                let beforeSend = function () {
                    $('#btnEmitirCTE').attr("disabled", "disabled");
                    coreProgress.showPreloader(undefined, 0);
                }

                let success = function (msg) {
                    $("#btnEmitirCTE").removeAttr("disabled");
                    coreDialog.close('.preloader');
                    console.log(msg);
                    if (msg.success == true) {

                        navigator.notification.alert("CTE Emitido com sucesso!", null, "Sucesso!", 'OK');
                        //$('#btnVoltar').click();
                    }else{
                        navigator.notification.alert(msg.message, null, "Erro!", 'OK');
                    }
                }

                let error = function (msg) {
                    coreDialog.close('.preloader');
                    $("#btnEmitirCTE").removeAttr("disabled");
                    console.log(msg);
                    navigator.notification.alert(msg.message, null, "Erro!", 'OK');
                }

                let data = {};
                data.emitente_id = cte_configs.emitente_id();
                data.tpAmb = cte_configs.tpAmb();
                data.username = window.localStorage.getItem("login");
                let notas = [];

                for(let i = 0; i <  document.notas.length; i++)
                {
                    notas.push({"num_nfe" : document.notas[i].num_nfe, "serie_nfe" : document.notas[i].serie_nfe,
                        "cnpj" : document.notas[i].cnpj})
                }

                data.notas = notas;

                cte_webservice_access.emitir_cte(JSON.stringify(data), beforeSend, success, error);
            })



          /* let dados_cte = window.localStorage.getItem("current_cte");
            dados_cte = JSON.Parse(dados_cte);
            if(dados_cte != null && dados_cte.resumo_cte != null) {
                document.resumo_cte = dados_cte.resumo_cte;
                document.refresh_resumo_cte = false;
                app.load_data_resumo_cte(document.resumo_cte);
                $.each(document.resumo_cte.notas, function (i, nota) {
                    app.addNota(nota);
                })
            }*/
            var dados_cte = window.localStorage.getItem("current_cte");
            if(dados_cte != null && dados_cte.length > 0) {
                dados_cte = JSON.parse(dados_cte);
                document.cte = dados_cte;
            }
            if(document.cte != null){

                $('#tab_dados_nfe').css("display", "none");
                $('#tab_resumo_cte').css("display", "none");
                $('#tab_emitir_cte').css("display", "inline-block");
                $('#tab_emitir_cte').click();
                $('#btnEmitirCTE').css("display", "none");
                $('#btnVisualizarCTE').css("display",
                    "block");
                if(document.cte.status == 7) {
                    $('#dacte').css("display", "inline");
                    $('#passo4').css("display", "block");
                    $('#passo3').css("display", "none");
                }



                $("#dacte").click(function () {
                    window.open(dados_cte.url_pdf, '_blank');
                });

                app.load_cte_status(dados_cte.chave);



            }


            $('.app').css("display", "inline");
        });
    },



    addNota: function(nota = null)
    {
        if(nota == null)
            nota = {};
        nota.cnpj = $('#cnpj').val();
        nota.num_nfe = $('#nfe').val();
        nota.serie_nfe = $('#serie').val();

        //Validações
        if(!(nota.num_nfe > 0 && nota.serie_nfe > 0 &&  nota.cnpj > 0))
            return false;

        if(document.notas != null && document.notas.length > 0) {

            let searchNotas = $.grep(document.notas, function (n, index) {
                return n.num_nfe == nota.num_nfe && n.serie_nfe == nota.serie_nfe && n.cnpj == nota.cnpj;
            });

            if (searchNotas.length > 0) {
                coreDialog.close('#dialogNFE');
                app.clear_nfe_fields();
                return; //Nota já foi inserida
            }

        }

        //metodos ajax
        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }
        let error = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
        }
        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg) ;
            //if (msg.success != true)
             //   return;
            if(msg.nfe == null)
            {
                navigator.notification.alert('NFE não encontrada', null, "Atenção!", 'OK');
                return;
            }


            if(document.notas != null && document.notas.length > 0)
            {

                var nfe = document.notas[0];


                //verifcando se a nota tem o mesmo endereço e destinatário e origem
                if(nfe.rem_xNome.trim() != msg.nfe.rem_xNome.trim()){
                    navigator.notification.alert('Remetente da nota, não é igual ao das notas já inseridas.\nRemetente: ' + msg.nfe.rem_xNome.trim(), null, "Atenção!", 'OK');
                    return;

                }else if(nfe.rem_xLgr.trim() != msg.nfe.rem_xLgr.trim()){
                    navigator.notification.alert('Endereço do remetente, não é igual ao das notas já inseridas.\nEndereço do remetente: ' + msg.nfe.rem_xLgr.trim(), null, "Atenção!", 'OK');
                    return;
                }
                else if(nfe.dest_xNome.trim() != msg.nfe.dest_xNome.trim()){
                    navigator.notification.alert('Destinatário da nota, não é igual ao das notas já inseridas.\nDestinatário: ' + msg.nfe.dest_xNome.trim(), null, "Atenção!", 'OK');
                    return;
                }
                else if(nfe.dest_xLgr.trim() != msg.nfe.dest_xLgr.trim()){
                    navigator.notification.alert('Endereço Destinatário da nota, não é igual ao das notas já inseridas\n.\nEndereço Destinatário: ' + msg.nfe.dest_xLgr.trim(), null, "Atenção!", 'OK');
                    return;
                }


            }


            //adiciona a nota carregada, na lista de notas
            document.notas.push(msg.nfe);
            document.refresh_resumo_cte = true;
            let i = document.notas.indexOf(msg.nfe);


             let destinatario = msg.nfe.dest_xNome.trim();
             let endereco =   msg.nfe.dest_xLgr.trim() + ", " +  msg.nfe.dest_xBairro.trim() + ", " +  msg.nfe.dest_xMun.trim();

            let row = '<li id="' + i + '" onclick="document.onClickGrid(this);" class="list-item with-second-label ' +(i % 2 ? 'bg-gray-50' : '' ) + '">' +
                '<span class="label" id="nota">NF-E: ' + nota.num_nfe + ' Série: ' + nota.serie_nfe  + '</span>' +
                '<span class="second-label" id="destinatario">Destinatário: ' + destinatario + '</span>' +
                '<span class="second-label" style="font-size: 0.8em;" id="endereco">Endereço: ' + endereco + '</span></li>';

            $("#lista_notas").append(row);

            app.clear_nfe_fields();

            app.check_list_buttons();

        }

        cte_webservice_access.buscar_nfe(nota, beforeSend,  success, error);


    },

    check_list_buttons: function(){

        if(document.notas != null && document.notas.length > 0) {
            $('#tab_resumo_cte').css("display", "inline-block");
            $('#tab_emitir_cte').css("display", "inline-block");
        }else{
            $('#tab_resumo_cte').css("display", "none");
            $('#tab_emitir_cte').css("display", "none");
        }

    },

    clear_nfe_fields: function(){

        $('#nfe').val('');
        $('#serie').val('');
    },


    load_cte_status: function (chave) {

        let success = function (data) {
            data = JSON.parse(data);
            if (data.status == 'success') {
                console.log(data);
                $('#status_cte').css("display", "block");
                $('#status_cte').html("Status CTE: " + data.status_descr);
            }
        }
        let error = function (msg) {
            console.log(msg);
        }
        let data = {};
        data.emitente_id = cte_configs.emitente_id();
        data.tpAmb = cte_configs.tpAmb();
        data.chave = chave;
        cte_webservice_access.get_cte_status(data, null, success, error);
    },

loadCentros: function () {
        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }
        let success = function (msg) {
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.success == true) {
                window.localStorage.setItem("centros_cte", JSON.stringify(msg.centros));
                app.load_centros_options();
            }

        }
        let error = function (msg) {
            app.load_centros_options();
            coreDialog.close('.preloader');
            console.log(msg);
        }
        let emitente = {};
        emitente.emitente_id = cte_configs.emitente_id();
        cte_webservice_access.get_centros(emitente, beforeSend, success, error);
    },

    load_centros_options: function () {
        document.centros = JSON.parse(window.localStorage.getItem("centros_cte"));
        $.each(document.centros, function (i, item) {
            $("#cnpj").append(new Option(item.nome_centro, item.cnpj));
        });
    },


    loadBarcode: function(){
        cordova.plugins.barcodeScanner.scan(
            function (result) {

                if(result.cancelled)
                    return;

                var code = result.text.trim();


                /*1 verificação - Tamanho do codigo capturado*/
                if (code.length != 44 && code.length != 12) {
                    util.showProcessMessage(false, 'Código de Barras',  'Código Inválido. Por favor tente novamente');
                    setTimeout(app.loadBarcode, 1600);
                }
                else
                    {

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

                    util.showProcessMessage(true, 'Código de Barras', 'Lido com sucesso');

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
                navigator.notification.confirm('Falha ao Escanear código de barras.\nPor favor tente novamente',
                    function (e) {
                        app.loadBarcode();
                    }, 'Erro', 'OK');


            },

            {
                preferFrontCamera : false, // iOS and Android
                showFlipCameraButton : false, // iOS and Android
                showTorchButton : true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                saveHistory: true, // Android, save scan history (default false)
                prompt : "Aponte o codigo de barras para a linha, para escanear", // Android
                resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats : "CODE_128", // default: all but PDF_417 and RSS_EXPANDED
                // orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations : true, // iOS
                disableSuccessBeep: false // iOS and Android
            }
        );
    },




    load_resumo_cte: function () {

       if(document.notas.length == 0)
           return;

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            $(".submitBtn").removeAttr("disabled");
            coreDialog.close('.preloader');
            console.log(msg);
            if (msg.success == true) {
                document.resumo_cte = msg.resumo_cte;
                document.refresh_resumo_cte = false;
                app.load_data_resumo_cte(msg.resumo_cte);

            }
            else
                document.resumo_cte = null;
        }
        let error = function (msg) {
            coreDialog.close('.preloader');
            $(".submitBtn").removeAttr("disabled");
            document.resumo_cte = null;
            console.log(msg);
        }

        let data = {};
        data.emitente_id = cte_configs.emitente_id();
        data.notas = document.notas;
        //console.log(data);
        cte_webservice_access.get_resumo_cte(JSON.stringify(data), beforeSend, success, error);


    },



    load_data_resumo_cte: function (data) {



        $("#nome_remetente").text(data.remetente.xNome);
        $("#uf_remetente").text(data.remetente.UF);
        $("#cidade_remetente").text(data.remetente.xMun);

        $("#nome_destinatario").text(data.destinatario.xNome);
        $("#endereco_destinatario").text(data.destinatario.xLgr);
        $("#uf_destinatario").text(data.destinatario.UF);
        $("#cidade_destinatario").text(data.destinatario.xMun);
        $("#cep_destinatario").text(data.destinatario.CEP);

        $("#valor_carga").text(data.carga.valorTotal);

        let notas = '';


        for(i = 0; i < data.nfe.length; i++) {
            if (data.nfe[i])
                notas += data.nfe[i] + ' ';
        }

        $("#notas_carga").text(notas) ;

        $("#peso_liquido_carga").text(data.carga.pesoL);
        $("#peso_bruto_carga").text(data.carga.pesoB);
        $("#qtde_volume_carga").text(data.carga.qtdVol);

        $("#valor_frete_valores").text(data.valores.freteValor);
        $("#pis_valores").text(data.valores.aliquotaPIS);
        $("#cofins_valores").text(data.valores.aliquotaCOFINS);
        $("#icms_valores").text(data.valores.aliquotaICMS);
        $("#simples_valores").text(data.valores.aliquotaSIMPLES);
        $("#total_aliquota_valores").text(data.valores.aliquotasIncidentes + "%");
        $("#total_tributos_valores").text(data.valores.totalTributos);
        $("#valor_total_frete_valores").text(data.valores.freteTotal);
        $("#cfop_valores").text(data.valores.cfop);

        $("#data_previsao_entrega_modal").text(data.modal.dataEntrega);
        $("#rntrc_modal").text(data.modal.rntrc);

        $("#obs_fisco").text(data.obs_fisco.obsFisco);

        $("#informacoes_cell").empty();
        $("#observacoes_frete_cell").empty();


        for(i = 0; i < data.obs_frete.length; i = i+2)
            $("#observacoes_frete_cell").append("<label class='dados-label'><strong>" + data.obs_frete[i][0] + "</strong>: " + data.obs_frete[i][1] +  "</label>");


        for(i = 0; i < data.infor.length; i = i +2)
            $("#informacoes_cell").append("<label class='dados-label'><strong>" + data.infor[i][0]  + "</strong>: " + data.infor[i][1]  +  "</label>");


    }




};
