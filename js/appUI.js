//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
let categorie = null;
Init_UI();

function Init_UI() {
    renderBookmarks();
    renderCategories();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $(document).on("click", 'div.dropdown-item.categorie', function () {
        categorie = $(this).attr("id_categorie");
        renderBookmarks();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de Bookmarks</h2>
                <hr>
                <p>
                    Petite application de gestion de Bookmarks à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Jean-Sébastien Labrie
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderBookmarks() {
    renderCategories();
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let Bookmarks = await Bookmarks_API.Get();
    eraseContent();
    if (Bookmarks !== null) {
        Bookmarks.forEach(Bookmark => {
            if (categorie != null && categorie != "all") {
                $("#checkall").empty().append('&emsp;');
                if (Bookmark.Catégorie == categorie) {
                    $("#content").append(renderBookmark(Bookmark));
                }
            } else {
                $("#checkall").empty().append('<i class="fa-solid fa-check"></i>');
                $("#content").append(renderBookmark(Bookmark));
            }

        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        $(".BookmarkRow").on("click", function (e) {
            redirectToBookmarkURL($(this).attr("bookmark_id"));
        });
    } else {
        renderError();
        // renderError("Service introuvable");
    }
}

async function redirectToBookmarkURL(id) {
    let bookmark = await Bookmarks_API.Get();
    if (bookmark != null) {
        bookmark.forEach(e => {
            if (e.Id == id)
                window.location.href = e.URL;
        })
    }
}

function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let Bookmark = await Bookmarks_API.Get(id);
    if (Bookmark !== null)
        renderBookmarkForm(Bookmark);
    else
        renderError("Bookmark introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let Bookmark = await Bookmarks_API.Get(id);
    eraseContent();
    if (Bookmark !== null) {
        $("#content").append(`
        <div class="BookmarkdeleteForm">
            <h4>Effacer le Bookmark suivant?</h4>
            <br>
            <div class="BookmarkRow" Bookmark_id=${Bookmark.Id}">
                <div class="BookmarkContainer">
                    <div class="BookmarkLayout">
                    
                    <div style="display: flex; align-items: center;">
                    <div class="big-icon" style="background-image: url(https://www.google.com/s2/favicons?sz=50&domain=${Bookmark.URL})"></div>
                    <span class="BookmarkTitre">${Bookmark.Titre}</span>
                </div>
                        <div class="BookmarkCatégorie">${Bookmark.Catégorie}</div>
                    </div>
                </div>  
            </div>
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await Bookmarks_API.Delete(Bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Bookmark introuvable!");
    }
}
function newBookmark() {
    Bookmark = {};
    Bookmark.Id = 0;
    Bookmark.Titre = "";
    Bookmark.URL = "";
    Bookmark.Catégorie = "";
    return Bookmark;
}

function renderDomainIcon(URL) {
    return (
        `
     <div style="display: flex; align-items: center;">
         <div class="big-icon" style="background-image: url(https://www.google.com/s2/favicons?sz=50&domain=${URL})"></div>
     </div>
     `
    );
}

function renderBookmarkForm(Bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = Bookmark == null;
    if (create) Bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="BookmarkForm">
            <input type="hidden" name="Id" value="${Bookmark.Id}"/>

            ${renderDomainIcon(Bookmark.URL).toString()}
            <br>
            <label for="Titre" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Titre" 
                id="Titre" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${Bookmark.Titre}"
            />
            <label for="URL" class="form-label">URL </label>
            <input
                class="form-control URL"
                name="URL"
                id="URL"
                placeholder="URL"
                required
                RequireMessage="Veuillez entrer un URL" 
                InvalidMessage="Veuillez entrer un URL valide"
                value="${Bookmark.URL}" 
            />
            <label for="Catégorie" class="form-label">Catégorie </label>
            <input 
                class="form-control Catégorie"
                name="Catégorie"
                id="Catégorie"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${Bookmark.Catégorie}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#BookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let Bookmark = getFormData($("#BookmarkForm"));
        Bookmark.Id = parseInt(Bookmark.Id);
        showWaitingGif();
        let result = await Bookmarks_API.Save(Bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(Bookmark) {
    return $(`
     <div class="BookmarkRow" Bookmark_id="${Bookmark.Id}">
     <div class="BookmarkContainer noselect">
            <div class="BookmarkLayout">
                <div style="display: flex; align-items: center;">
                    <div class="big-icon" style="background-image: url(https://www.google.com/s2/favicons?sz=50&domain=${Bookmark.URL})"></div>
                    <span class="BookmarkTitre">${Bookmark.Titre}</span>
                </div>
                <span class="BookmarkCatégorie">${Bookmark.Catégorie}</span>
            </div>
            <div class="BookmarkCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${Bookmark.Id}" title="Modifier ${Bookmark.Titre}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${Bookmark.Id}" title="Effacer ${Bookmark.Titre}"></span>
            </div>
        </div>
    </div>           
    `);
}

async function renderCategories() {
    let bookmarks = await Bookmarks_API.Get();
    $(".liste-categorie").empty();
    let categories = new Array();
    bookmarks.forEach(e => {
        if (!categories.includes(e.Catégorie)) {
            categories.push(e.Catégorie);
            $(".liste-categorie").append(`
            <div class="dropdown-item categorie" id_categorie="${e.Catégorie}">
            <i class="menuIcon fa mx-2">${categorie == e.Catégorie ? '<i class="fa-solid fa-check"></i>' : "&emsp;"}</i> ${e.Catégorie}
            </div>
            `);
        }
    });
}