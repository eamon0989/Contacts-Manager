import { contactsList, tagList } from '/javascripts/classes.js';
import { ui } from '/javascripts/ui.js';
tagList.getTagsFromServer().then(_ => contactsList.getContactsFromServer());

document.addEventListener('DOMContentLoaded', e => {
  tagList.getTags();
  ui.addEventListeners();
})
