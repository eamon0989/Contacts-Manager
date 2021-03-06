import { contactsList, tagList } from '/javascripts/classes.js';

class UI {
  constructor() {
    this.createForm = document.getElementById('create-form'),
    this.createContactDiv = document.getElementById('create-contact'),
    this.editForm = document.getElementById('edit-form'),
    this.editFormDiv = document.getElementById('edit-contact'),
    this.tagForm = document.getElementById('create-tag-form'),
    this.showContactsBtn = document.getElementById('show-all-contacts'),
    this.searchBox = document.getElementById('search_bar'),
    this.tagInput = document.getElementById('create-tag'),
    this.filtered = document.getElementById('showing-filtered'),
    this.showContactsBtn = document.getElementById('show-all-contacts'),
    this.addContactButtons = document.querySelectorAll("[data-role='add-contact']"),
    this.createFormReset = document.querySelector('#create-form [type="reset"]'),
    this.cancelEditContactBtn = document.getElementById('cancel-edit-contact'),
    this.editForm = document.getElementById('edit-form'),
    this.contactsTemplate = document.getElementById('contacts-template'),
    this.tagPartial = document.getElementById('tags-partial'),
    this.contactsListUL = document.getElementById('contacts-list');
  }

  addEventListeners() {
    this.createForm.addEventListener('submit', this.contactCreateFormSubmitListener.bind(this));
    this.editForm.addEventListener('submit', this.editFormSubmitListener.bind(this));
    this.tagForm.addEventListener('submit', this.tagFormSubmitListener.bind(this));
    this.searchBox.addEventListener('input', this.searchBoxInputListener.bind(this));
    this.showContactsBtn.addEventListener('click', this.showContactsBtnClickListener.bind(this));
    this.createFormReset.addEventListener('click', this.cancelCreateContact.bind(this));
    this.cancelEditContactBtn.addEventListener('click', this.cancelEditContactListener.bind(this));
    document.addEventListener('click', this.documentClickHandler.bind(this));

    [...this.addContactButtons].forEach(btn => {
      btn.addEventListener('click', this.addContactButtonsListener.bind(this));    
    });
  }

  documentClickHandler(e) {
    let links = document.querySelectorAll('.tag-links > a')
    let editContactBtns = document.querySelectorAll('a[href*="edit"]');
    let deleteContactBtns = document.querySelectorAll('a[href*="delete"]');

    if ([...links].includes(e.target)) {
      this.displayContactsWithTagListener(e);
    }

    if ([...editContactBtns].includes(e.target.parentElement)) {
      this.editContactBtnsListener(e);
    }

    if ([...deleteContactBtns].includes(e.target.parentElement)) {
      this.deleteContactBtnsListener(e);
    }
  }

  displayContactsWithTagListener(e) {
    e.preventDefault();
    let tagName = e.target.textContent;
    contactsList.displayContactsWithTag(tagName);
  }

  deleteContactBtnsListener(e) {
    e.preventDefault();
    let alert = window.confirm('Are you sure you want to delete?');
    if (alert) {
      let id = e.target.parentElement.href.match(/\d+$/)[0];
      contactsList.deleteContact(e, id);
    }
  }

  editContactBtnsListener(e) {
    e.preventDefault();
    let id = e.target.parentElement.href.match(/\d+$/)[0];

    tagList.addTagsToForm(this.editForm);
    contactsList.displayEditContactForm(id);
  }

  showContactsBtnClickListener(e) {
    contactsList.displayContacts();
    this.showContactsBtn.setAttribute('hidden', 'hidden');
    this.filtered.style.display = 'none';
  }

  searchBoxInputListener(e) {
    this.filtered.style.display = 'none';
    let searchTerm = e.target.value;
    contactsList.searchContacts(searchTerm);
  }

  tagFormSubmitListener(e) {
    e.preventDefault();
    let tag = this.tagInput.value;
    tagList.postTagToServer(tag);
    this.tagForm.reset();
  }

  editFormSubmitListener(e) {
    e.preventDefault();

    let json = UI.makeJsonFromForm(this.editForm);
    contactsList.saveEditedContactToServer(json);
    this.editForm.reset();
    this.editFormDiv.style.display = 'none';
  }

  contactCreateFormSubmitListener(e) {
    e.preventDefault();

    let json = UI.makeJsonFromForm(this.createForm);
    contactsList.saveContactToServer(json);
    this.createForm.reset();
    this.createContactDiv.style.display = 'none';

    //resets 'Showing contacts div' if open
    let click = new Event('click');
    this.showContactsBtn.dispatchEvent(click);
  }

  cancelEditContactListener(e) {
    document.getElementById('edit-contact').style.display = 'none';
    document.getElementById('display-contacts').style.display ='flex';

    if (contactsList.contactsListEmpty()) {
      document.getElementById('no-contacts').style.display ='flex';
      document.getElementById('display-contacts').style.display ='none';
    }
  }

  addContactButtonsListener(e) {
    tagList.addTagsToForm(this.createForm);

    document.getElementById('create-contact').style.display = 'flex';
    document.getElementById('no-contacts').style.display ='none';
    document.getElementById('display-contacts').style.display ='none';
  }

  cancelCreateContact(e) {
    document.getElementById('create-contact').style.display = 'none';
    document.getElementById('display-contacts').style.display ='flex';

    if (contactsList.contactsListEmpty()) {
      document.getElementById('no-contacts').style.display ='flex';
      document.getElementById('display-contacts').style.display ='none';
    }
  }

  static makeJsonFromForm(form) {
    let data = new FormData(form);
    let json = {};
  
    for (let prop of data) {
      if (!json[prop[0]]) {
        json[prop[0]] = prop[1];
      } else {
        json[prop[0]] += `,${prop[1]}`;
      }
    }
  
    if (!json.tags) {
      json.tags = '';
    }
  
    return json;
  }

  createContactCard(contacts) {
    if (!Array.isArray(contacts)) {
      contacts = [contacts];
    }

    let handlebarsTemplate = Handlebars.compile(this.contactsTemplate.innerHTML);
    Handlebars.registerPartial("tagsPartial", this.tagPartial.innerHTML);
  
    let newContacts = contacts.map(contact => {
      let tagsArray;
      if (contact.tags && typeof contact.tags === 'string') {
        tagsArray = contact.tags.split(',');
        contact.tags = tagsArray;
      }
       
      return contact;
    })
  
    this.contactsListUL.innerHTML = handlebarsTemplate({ contacts: newContacts});
  }
}

export let ui = new UI();