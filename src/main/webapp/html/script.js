console.log("ready!");

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
    enableEditingField(children[3], playerId, 'race');
    enableEditingField(children[4], playerId, 'profession');
    enableEditingField(children[5], playerId, 'banned');

}
function enableEditingField(tdElement, playerId, fieldName) {
    tdElement.innerHTML = `<input id='input_${fieldName}${playerId}' type='text' value='${tdElement.innerHTML}'>`;
}

$(document).ready(function () {
    // Отримуємо та виводимо загальну кількість облікових записів перед заповненням таблиці
    let totalCount = getTotalAccountCount();
    let countPage = $('#pageSizeSelect').val();
    let pageCount = calculatePageCount(totalCount, countPage);

    createPaginationButtons(pageCount, countPage);

    fillTableWithPlayers(0, countPage); // Заповнюємо таблицю при завантаженні сторінки з параметрами 0 і обраного розміру сторінки
});
