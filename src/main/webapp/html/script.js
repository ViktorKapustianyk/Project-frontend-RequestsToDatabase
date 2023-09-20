console.log("ready!");
let isEditing = false; // Глобальная переменная для отслеживания редактирования


function fillTableWithPlayers(page_number, page_size) {
    let url = "/rest/players";

    // Modify the URL to include pageNumber and pageSize query parameters
    url += `?pageNumber=${page_number}&pageSize=${page_size}`;

    $.get(url, function (data) {
        // Очистити таблицю перед заповненням новими даними
        $("#accounts-table-body").empty();

        $.each(data, function (index, player) {
            $('<tr>').html("<td>"
                + player.id + "</td><td>"
                + player.name + "</td><td>"
                + player.title + "</td><td>"
                + player.race + "</td><td>"
                + player.profession + "</td><td>"
                + player.level + "</td><td>"
                + new Date(player.birthday).toLocaleDateString() + "</td><td>"
                + player.banned + "</td><td>"
                + "<button id='button_edit" + player.id + "'onclick='edit_player(" + player.id + ")'>"
                + "<img src='/img/edit.png'>"
                + "</button>"+"</td><td>"
                + "<button id='button_delete" + player.id + "' onclick='delete_player(" + player.id + ")'>"
                + "<img src='/img/delete.png'>"
                + "</button>"+"</td>"
            ).appendTo("#accounts-table-body"); // Вставка в tbody
        });
        // Clear previous highlighting
        $('button.pgn_btn_style').css('color', '');

        // Highlight the current page button
        let identifier = '#paging_button_' + page_number;
        $(identifier).css('color', 'red');
    });
}

// Виправлена функція для отримання загальної кількості облікових записів
function getTotalAccountCount() {
    let url = "/rest/players/count";
    let res = 0;

    $.ajax({
        url: url,
        async: false,
        success: function (result) {
            res = parseInt(result);
        },
        error: function () {
            console.error("Failed to fetch total account count.");
        }
    });

    return res;
}

function createPaginationButtons(pageCount, page_size) {
    $('button.pgn_btn_style').remove();

    for (let i = 0; i < pageCount; i++) {
        let button_tag = "<button>" + (i + 1) + "</button>";
        let btn = $(button_tag)
            .attr('id', "paging_button_" + i)
            .attr('onclick', `fillTableWithPlayers(${i}, ${page_size})`)
            .addClass('pgn_btn_style');
        $('#pagination').append(btn);
    }
}

function calculatePageCount(totalCount, countPage) {
    if (countPage == null) {
        countPage = 3;
    }

    return Math.ceil(totalCount / countPage);
}

function updatePagination() {
    let totalCount = getTotalAccountCount();
    let countPage = $('#pageSizeSelect').val();
    let pageCount = calculatePageCount(totalCount, countPage);

    createPaginationButtons(pageCount, countPage);

    // When the page size changes, reset to the first page
    fillTableWithPlayers(0, countPage);
}

function delete_player(id){
    $.ajax({
        url: `/rest/players/${id}`,
        type: 'DELETE',
        async: false,
        success: function () {
            updatePagination();
        }
    });
}

function edit_player(playerId) {

    let identifier_edit = '#button_edit' +playerId;
    let current_tr_element = $(identifier_edit).parent().parent();
    let children = current_tr_element.children();

        // Change the image on the Edit button
        $(`#button_edit${playerId} img`).attr('src', '../img/save.png');
        // Hide the Delete button
        $(`#button_delete${playerId}`).hide();

        // Enable editing for the specific row's fields
        enableEditingField(children[1], playerId, 'name');
        enableEditingField(children[2], playerId, 'title');

    let td_race = children[3];
    let race_current_value = td_race.innerHTML;
    td_race.innerHTML = getDropDownRaceHTML(playerId, race_current_value);

    let td_profession = children[4];
    let profession_current_value = td_profession.innerHTML;
    td_profession.innerHTML = getDropDownProfessionHTML(playerId, profession_current_value);

    let td_banned = children[7];
    let banned_current_value = td_banned.innerHTML;
    td_banned.innerHTML = getDropDownBannedHTML(playerId, banned_current_value);

    let property_save_tag = "sendChangesToServer("+ playerId + ")";
    $(identifier_edit).attr('onclick', property_save_tag)

}
function enableEditingField(tdElement, playerId, fieldName) {
    tdElement.innerHTML = `<input id='input_${fieldName}${playerId}' type='text' value='${tdElement.innerHTML}'>`;
}

function getDropDownRaceHTML(id, currentValue) {
    let race_id = "select_race" + id;
    return "<label for='race'></label>"
        + "<select id=" + race_id + " name='race'>"
        + `<option value='HUMAN' ${currentValue === 'HUMAN' ? 'selected' : ''}>HUMAN</option>`
        + `<option value='DWARF' ${currentValue === 'DWARF' ? 'selected' : ''}>DWARF</option>`
        + `<option value='ELF' ${currentValue === 'ELF' ? 'selected' : ''}>ELF</option>`
        + `<option value='GIANT' ${currentValue === 'GIANT' ? 'selected' : ''}>GIANT</option>`
        + `<option value='ORC' ${currentValue === 'ORC' ? 'selected' : ''}>ORC</option>`
        + `<option value='TROLL' ${currentValue === 'TROLL' ? 'selected' : ''}>TROLL</option>`
        + `<option value='HOBBIT' ${currentValue === 'HOBBIT' ? 'selected' : ''}>HOBBIT</option>`
        + "</select>";
}

function getDropDownProfessionHTML(id, currentValue) {
    let profession_id = "select_profession" + id;
    return "<label for='profession'></label>"
        + "<select id=" + profession_id + " name='profession'>"
        + `<option value='WARRIOR' ${currentValue === 'WARRIOR' ? 'selected' : ''}>WARRIOR</option>`
        + `<option value='ROGUE' ${currentValue === 'ROGUE' ? 'selected' : ''}>ROGUE</option>`
        + `<option value='SORCERER' ${currentValue === 'SORCERER' ? 'selected' : ''}>SORCERER</option>`
        + `<option value='CLERIC' ${currentValue === 'CLERIC' ? 'selected' : ''}>CLERIC</option>`
        + `<option value='PALADIN' ${currentValue === 'PALADIN' ? 'selected' : ''}>PALADIN</option>`
        + `<option value='NAZGUL' ${currentValue === 'NAZGUL' ? 'selected' : ''}>NAZGUL</option>`
        + `<option value='WARLOCK' ${currentValue === 'WARLOCK' ? 'selected' : ''}>WARLOCK</option>`
        + `<option value='DRUID' ${currentValue === 'DRUID' ? 'selected' : ''}>DRUID</option>`
        + "</select>";
}
function getDropDownBannedHTML(id, currentValue) {
    let banned_id = "select_banned" + id;
    return "<label for='banned'></label>"
        + "<select id=" + banned_id + " name='banned'>"
        + `<option value='true' ${currentValue === 'true' ? 'selected' : ''}>true</option>`
        + `<option value='false' ${currentValue === 'false' ? 'selected' : ''}>false</option>`
        + "</select>";
}

function sendChangesToServer(playerId) {
    let value_name = $("#input_name" +playerId).val();
    let value_title = $("#input_title" +playerId).val();
    let value_race = $("#select_race" +playerId).val();
    let value_profession = $("#select_profession" +playerId).val();
    let value_banned = $("#select_banned" +playerId).val();

    let url = "/rest/players/" + playerId;
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json;charset=UTF-8', // Указываем тип контента как JSON
        async: false,
        data: JSON.stringify({
            "name":value_name,
            "title":value_title,
            "race":value_race,
            "profession":value_profession,
            "banned":value_banned
            }),
        success: function () {
            // Обработка успешного ответа от сервера
            updatePagination();
        }
    });
}

$(document).ready(function () {
    // Отримуємо та виводимо загальну кількість облікових записів перед заповненням таблиці
    let totalCount = getTotalAccountCount();
    let countPage = $('#pageSizeSelect').val();
    let pageCount = calculatePageCount(totalCount, countPage);

    createPaginationButtons(pageCount, countPage);

    fillTableWithPlayers(0, countPage); // Заповнюємо таблицю при завантаженні сторінки з параметрами 0 і обраного розміру сторінки
});
