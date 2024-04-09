
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
            //util.return_last_page();
        }, false);

        $(document).ready(function (e) {

            util.getCurrentGeoLocation();
            document.remessas = [];
            var cache_remesas = window.localStorage.getItem("coleta_remessas_cache");
            if(cache_remesas != null && cache_remesas.length > 0)
            {
                navigator.notification.confirm('Existem dados de uma coleta já salvada.\nDeseja continuar de onde parou?',
                    function (e) {
                        if (e == 1) {
                            document.remessas = JSON.parse(cache_remesas);
                            app.loadRemessas();
                        }
                        else
                            window.localStorage.setItem("coleta_remessas_cache", ""); //limpa o cache
                    }, 'Dados Coleta', 'Continuar Coleta,Iniciar Nova');
            }


            $("#btnVoltar").click(function () {
                util.return_last_page();
            })

            $("#btnBarcode").click(function () {
                app.loadBarcode();
                coreDialog.close('#dialogAdicionarOpcoes');
                coreDialog.close('#dialogAdicionarManifesto');
            });

            $("#btnManual").click(function () {
                coreDialog.close('#dialogAdicionarOpcoes');
                coreDialog.close('#dialogAdicionarManifesto');
                coreDialog.open('#dialogAdicionarManual');
            });

            $("#btnManifesto").click(function () {
                coreDialog.close('#dialogAdicionarOpcoes');
                coreDialog.close('#dialogAdicionarManual');
                app.scanBarcodeManifesto();
                coreDialog.open('#dialogAdicionarManifesto');
            });

            $("#button_scanner_manifesto").click(function () {
                app.scanBarcodeManifesto();
            });



            $(".tab").click(function () {
                (this.id == 'tab_dados') ? $("#btnNovo").show() : $("#btnNovo").hide();
            });


            screen.orientation.lock('portrait');

            var canvas = document.getElementById("padCanvas");
            var signaturePad = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                minWidth: 0.5,
                maxWidth: 1
            });

            document.signaturePad = signaturePad;
            window.signaturePad = signaturePad;


            $("#btnEnviarColetaRemessa").click(function () {

                let beforeSend = function () {
                    $('#btnEnviarColetaRemessa').attr("disabled", "disabled");
                    coreProgress.showPreloader(undefined, 0);
                }

                let success = function (msg) {
                    $("#btnEnviarColetaRemessa").removeAttr("disabled");
                    coreDialog.close('.preloader');
                    //console.log(msg);
                    if (msg.success) {
                        window.localStorage.setItem("coleta_remessas_cache", ""); //limpa o cache
                        navigator.notification.alert("Coleta Realizada com Sucesso!", null, "Sucesso!", 'OK');
                        $('#btnVoltar').click();
                    } else {
                        navigator.notification.alert("Houve um erro ao enviar, por favor tente novamente!", null, "Erro", 'OK');
                    }
                }

                let error = function (msg) {
                    coreDialog.close('.preloader');
                    $("#btnEnviarColetaRemessa").removeAttr("disabled");
                    navigator.notification.alert("Houve um erro ao enviar, por favor tente novamente!", null, "Erro", 'OK');
                    console.log(msg);
                }

                let usuario = window.localStorage.getItem("login");
                let dados = {
                    "usuario": usuario, "remessas": document.remessas
                };

                var assinatura = $('#signImg').attr('src');
                if(assinatura != null)
                    dados.img_assinatura = assinatura;//base64

                dados.nome_responsavel = $('#nome_responsavel').val();
                dados.rg_responsavel = $('#rg_responsavel').val();

                coleta_webservice_access.coletar_remessa(JSON.stringify(dados), beforeSend, success, error);
            })



        });
    },

    loadRemessas: function(){

        $("#tabela_remessas > tbody").empty();
        console.log(document.remessas);
        let remessas = document.remessas.sort(function (a, b) {
            let order = a.status > b.status ? 1 : 0;
            order += a.numero_remessa > b.numero_remessa;
            return order;
            
        });

        $.each(remessas, function (i, r) {

            let remessa = r.numero_remessa;
            let volume_total = r.volume_total;
            let coletado = r.volumes.length;

            let row =  "<tr id='remessa_" + remessa + "' class='" + (r.volumes.length == r.volume_total ? "fg-green" : "") + "'>";
            row +=  "<th>" + remessa + "</th>";
            row +=  "<td>" + coletado + " de " + volume_total + "</td>";
            row +=  "<td>" + (r.volumes.length == r.volume_total ? "OK" : "Coletando") + "</td>";
            row +=  "</tr>";

            $("#tabela_remessas > tbody").append(row);
        });

        //Carregando tabelas de conferências
        $("#tabela_conferencia_remessas > tbody").remove();

        $.each(remessas, function (i, r) {

            let remessa = r.numero_remessa;
            let volume_total = r.volume_total;
            let coletado = r.volumes.length;

            let row = "<tbody class='border-all'>";
            row +=  "<tr id='remessa_" + remessa + "' class='acc " + (r.volumes.length == r.volume_total ? "fg-green" : "fg-red") + " border-all'>";
            row +=  "<th>" + remessa + "</th>";
            row +=  "<td>" + coletado + " de " + volume_total + "</td>";
            if(r.volumes.length == r.volume_total)
                row +=  "<td><button id='btn_" + remessa + "' onclick='app.btn_acao_click()' class='raised-button' style='font-size: 0.9em'>Remover</button></td>";
            else
                row +=  "<td><button id='btn_" + remessa + "' onclick='app.btn_acao_click()' class='raised-button' style='font-size: 0.9em'>Justificar</button></td>";
            row +=  "</tr>";


            row += "<tr class='fold bg-gray-200'>";
            row +=  "<th>Data</th>";
            row +=  "<th>Volume</th>";
            row +=  "<th>Status</th>";
            row +=  "</tr>";

            for(let i = 1; i <= volume_total; i++)
            {
                let searchVolumes = $.grep(r.volumes, function (v, index) {
                    return v.volume == i;
                });


                if(searchVolumes.length > 0)
                {
                    let v = searchVolumes[0];
                    row += "<tr class='fg-green fold bg-gray-50'>";
                    row +=  "<td>" + moment(v.data_hora).format('DD/MM/YYYY HH:mm') + "</td>";
                    row +=  "<td>" + v.volume + "/" + volume_total + "</td>";
                    row +=  "<td>COLETADO</td>";
                    row +=  "</tr>";
                }
                else
                {
                    row += "<tr class='fg-red fold bg-gray-50'>";
                    row +=  "<td>SEM DATA</td>";
                    row +=  "<td>" + i + "/" + volume_total + "</td>";
                    row +=  "<td>NÃO COLETADO</td>";
                    row +=  "</tr>";
                }
            }
            row += "</tbody>";

            $("#tabela_conferencia_remessas").append(row);


        });

        $(function() {
            var $research = $('#tabela_conferencia_remessas');

            $research.find('.fold').hide();
            $research.find('.acc').show();
            $research.find(".acc").click(function(){
                $(this).siblings("tr.fold").toggle();
            });
        });



    },

    btn_acao_click: function(){

        let numero_remessa = event.srcElement.id.replace('btn_', '');
        let searchRemessa = $.grep(document.remessas, function (r, index) {
            return r.numero_remessa == numero_remessa;
        });

        if(searchRemessa.length > 0){
            let remessa = searchRemessa[0];
            if(remessa.volumes.length == remessa.volume_total) {
                //caso já esteja completo, pergunta se deseja remover da lista
                navigator.notification.confirm('Você tem certeza que deseja remover a remessa Nº: \n\n' + remessa.numero_remessa + ' ?',
                    function (e) {
                        if (e == 1) {
                            document.remessas =  $.grep(document.remessas, function (r, index) {
                                return r.numero_remessa != remessa.numero_remessa;
                            });
                            app.loadRemessas();
                        }
                    }, 'Confirmar Exclusão', 'Remover,Cancelar');
            }
            else {
                $('#status_transporte').val('NAO_COLETADO');
                $('#status_transporte').attr("disabled", false);
                $('#observacoes').val(remessa.observacoes);
                coreDialog.open('#dialogOcorrencias');
                document.remessa = remessa;
            }
        }
    },

    salvar_dados_ocorrencia_remessa: function()
    {
        let remessa = document.remessa;
        remessa.observacoes = $('#observacoes').val();
        remessa.status = $('#status_transporte').val();
        $('#observacoes').val('');
        window.localStorage.setItem("coleta_remessas_cache", JSON.stringify(document.remessas));
        coreDialog.close('#dialogOcorrencias');
    },


    createRemessa: function(numero_remessa, num_volume = 0, volume_total = 0, create_all_volumes = false){

        let remessa = {};
        remessa.volumes = [];
        //verifica se a remessa já está na lista
        let findRemessa = $.grep(document.remessas, function(e, i) {
            return  e.numero_remessa == numero_remessa;
        });

        if(findRemessa.length == 0) {
            remessa.numero_remessa = numero_remessa;
            remessa.volume_total = volume_total;
            document.remessas.push(remessa);
        }
        else
            remessa = findRemessa[0];




        if(create_all_volumes){
           //neste caso, todos volumes serão criados automaticamente, baseados no volume total
            for(let i = 1; i <= volume_total; i++) {
                let volume = {};
                volume.volume = i;
                volume.coletado = true;
                volume.data_hora = moment().format("YYYY-MM-DDTHH:mm:ss");
                volume.latitude = 0;
                volume.longitude = 0;
                if (document.current_position != null) {
                    volume.latitude = document.current_position.coords.latitude;
                    volume.longitude = document.current_position.coords.longitude;
                }
                remessa.volumes.push(volume);
            }
        }
        else
            {
                //cria o volume, unitariamente
            //verifica se a remessa já está na lista
            let findVolume = $.grep(remessa.volumes, function (e, i) {
                return e.volume == num_volume;
            });

            if (findVolume.length == 0 && num_volume > 0) {
                let volume = {};
                volume.volume = num_volume;
                volume.coletado = true;
                volume.data_hora = moment().format("YYYY-MM-DDTHH:mm:ss");
                volume.latitude = 0;
                volume.longitude = 0;
                if (document.current_position != null) {
                    volume.latitude = document.current_position.coords.latitude;
                    volume.longitude = document.current_position.coords.longitude;
                }
                remessa.volumes.push(volume);
            }
        }

        if(remessa.volumes.length == remessa.volume_total)
            remessa.status = 'COLETADO';
        else
            remessa.status = 'COLETADO_PARCIALMENTE'

        remessa.observacoes = '';
        //salvando cache da coleta das remessas
        window.localStorage.setItem("coleta_remessas_cache", JSON.stringify(document.remessas));

        return remessa;

    },

    addRemessaManual: function(){

        let num_remessa = parseInt($('#remessa').val());
        let volume_total = parseInt($('#qtde_volumes').val());


        app.createRemessa(num_remessa, 0, volume_total, true);

        $('#remessa').val('');
        $('#qtde_volumes').val('');

        app.loadRemessas();
        coreDialog.close('#dialogAdicionarManual');

    },

    addRemessaManifesto: function(){

        app.load_dados_manifesto($('#manifesto').val());
        coreDialog.close('#dialogAdicionarManifesto');
    },




    loadBarcode: function(){
        cordova.plugins.barcodeScanner.scan(
            function (result) {

                if(result.cancelled)
                    return;

                var code = result.text.trim();
                /* Realizar logicas de validação do codigo capturado*/

                /*1 verificação - Tamanho do codigo capturado*/

            if(code.length == 13) {

                let num_remessa = parseInt(code.substr(0, 9));
                let num_volume = parseInt(code.substr(9, 2));
                let volume_total = parseInt(code.substr(11, 2));

                let findRemessa = $.grep(document.remessas, function(e, i) {
                    return  e.numero_remessa == num_remessa;
                });

                if(findRemessa.length > 0) {
                    app.createRemessa(num_remessa, num_volume, volume_total, false);
                    app.loadRemessas();
                    util.showProcessMessage(true, 'Código de Barras', 'Lido com sucesso');
                    setTimeout(app.loadBarcode, 1600);
                }else{
                    util.showProcessMessage(false, 'ATENÇÃO!', 'Remessa não encontrada na lista, por favor, escaneie o manifesto, antes de escanear a remessa!', 4000);
                    setTimeout(app.loadBarcode, 4000);
                }




             }
            else {
                util.showProcessMessage(false, 'Código de Barras',  'Código Inválido. Por favor tente novamente');
                setTimeout(app.loadBarcode, 1600);
              /*  navigator.notification.confirm('Código Inválido.\nPor favor tente novamente',
                    function (e) {
                        app.loadBarcode();
                    }, 'Erro', 'OK');*/
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


    scanBarcodeManifesto: function(){
        cordova.plugins.barcodeScanner.scan(
            function (result) {

                if(result.cancelled)
                    return;

                var code = result.text.trim();

                if(code.length == 10 || code.length == 15) {

                    util.showProcessMessage(true, 'Código de Barras', 'Lido com sucesso');
                    $('#manifesto').val(code);
                }
                else {
                    util.showProcessMessage(false, 'Código de Barras',  'Código Inválido. Por favor tente novamente');
                    setTimeout(app.scanBarcodeManifesto, 1600);
                }

            },
            function (error) {
                navigator.notification.confirm('Falha ao Escanear código de barras.\nPor favor tente novamente',
                    function (e) {
                        app.scanBarcodeManifesto();
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

    load_dados_manifesto : function (num_manifesto) {

        let beforeSend = function () {
            coreProgress.showPreloader(undefined, 0);
        }

        let success = function (msg) {
            $('#manifesto').val('');
            coreDialog.close('.preloader');
            console.log(msg);
            alert(msg);
            //  console.log("PASSOU AQUI1");
            if (msg.success) {
                window.localStorage.setItem("manifesto_remessa", JSON.stringify(msg.remessas));


                $.each(msg.remessas, function (i, item) {
                    app.createRemessa(item.remessa, 0, item.volume, false);
                });
                $('#btnBarcode').prop("disabled", false);

                app.loadRemessas();
            }
        }

        let error = function (msg) {

            coreDialog.close('.preloader');

            erro  = msg.responseJSON.message;
            console.log(erro);
            navigator.notification.alert(erro, null,"Erro", "OK");


        }
        let usuario = window.localStorage.getItem("login");
        let dados = {
            "usuario": usuario, "manifesto": num_manifesto
        };


        coleta_webservice_access.load_remessa_manifesto(JSON.stringify(dados), beforeSend, success, error);

    },



};
