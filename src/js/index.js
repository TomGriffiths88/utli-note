/////////////////////////////////////////////////////////////////
/// data controller module //////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////


const data = (function() {

    //constructor function for each note
    var Note = function(note, tags) { 
        let date = new Date().toLocaleDateString();
        this.note = note;
        this.tags = tags;
        this.date = date;
        this.id = new Date().getTime();
    };
      

	var app = {
    state: {
        input: false,
        currentFilter: '',
        delMode: false
    },
  	notes: [],
    parseNote: function(note) {
        var tags=[];
        var parsedNote = [];
        var arr = note.split(' ');
        
        arr.forEach(function(cur){
            if(cur.indexOf('#') == 0){
                tags.push(cur);  
            } else {
                parsedNote.push(cur);
            }

        });

        return {
            note: parsedNote.join(' '),
            tags: tags
        };
    },
    addNote: function(input) {
        let note = new Note(input.note, input.tags);
        this.notes.push(note);
        return note;
    },
    filterNotes: function() {
        let filter = this.state.currentFilter;
        let filteredNotes = this.notes.filter((note) => note.tags.indexOf(filter) === -1);
        return filteredNotes;
    },
    delNotes: function(ids) {
        var updatedNotes = [];

        for (var i = 0; i < ids.length; i++) {
            if (this.notes.indexOf(ids[i]) > -1) {
                updatedNotes.push(this.notes[i]);
            }
        }

        this.notes = updatedNotes;
    }
    
  };
  
  return {
  	parseNote: app.parseNote,
    addNote: app.addNote,
    state: app.state,
    notes: app.notes,
    filterNotes: app.filterNotes,
    delNotes: app.delNotes
  }
  
  
})(window);


/////////////////////////////////////////////////////////////////
/// UI controller module //////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

const UIcontroller = (function(){

   var createNoteElement = function(newNote) {

       return `
       <div class="notecard" id="${newNote.id}">
        <div class="notecard__meta">
        <div class="checkbox">
            <input type="checkbox" class="checkbox__input" data-id="${newNote.id}" name="checkbox">
            <label class="checkbox__label" for="checkbox"></label>
        </div>
                <p class="notecard__date">${newNote.date}</p>
                <ul class="notecard__tags">
                </ul>
            </div>
        <p class="notecard__note">${newNote.note}</p>
       </div>
       `;
   };

   var renderTags = function(tags, id){
        tags.forEach(function(el) {
            let tag = `<li class="notecard__tag" data-tag="${el}">${el}</li>`;
            document.getElementById(`${id}`).querySelector('ul').insertAdjacentHTML('beforeend', tag);
        });
   };


  return {
  	
        getNoteInput: function() {

        return {
                note: document.querySelector('#noteInput').value
        }
        
        },
        
        showInput: function() { 
            data.state.input = true;
            document.querySelector('.input').classList.add('active');
            document.querySelector('#noteInput').value = '';
            document.querySelector('#noteInput').focus();
        },
        resetInput: function() {
            data.state.input = false;
            document.querySelector('#noteInput').value = '';
            document.querySelector('.input').classList.remove('active');
        },
        insertNote: function(note) {
            var noteElement = createNoteElement(note);
            document.querySelector('.notebook').insertAdjacentHTML("afterbegin", noteElement);
            renderTags(note.tags, note.id);
        },
        filterNotes: function(els) {
            els.forEach(function(cur) {
                document.getElementById(cur.id).classList.add('hidden');
            });
        },
        clearFilters: function() {
            if(document.querySelectorAll('.hidden')) {
                document.querySelectorAll('.hidden').forEach(function(el) {
                    el.classList.remove('hidden');
                });
            }
        },
        enterDelMode: function() {
            document.querySelectorAll('.notecard__selBox').forEach(function(el) {
                el.classList.add('visible');
            });
            document.querySelector('#delBtn').style.display = 'none';
            document.querySelector('#addBtn').style.display = 'none';
            document.querySelector('#delSel').style.display = 'block';
            document.querySelector('.checkbox__input').addEventListener('change', function() {
                console.log('checked');
            });
        },
        exitDelMode: function() {
            document.querySelectorAll('.notecard__selBox').forEach(function(el) {
                el.classList.remove('visible');
            });
            document.querySelector('#addBtn').style.display = 'block';
            document.querySelector('#delBtn').style.display = 'block';
            document.querySelector('#delSel').style.display = 'none';
        },
        getSelected: function() {
            var selectedNotes = [];
            document.querySelectorAll('.notecard__selBox').forEach(function(el) {
                if (el.checked) {
                    selectedNotes.push(el.dataset.id);
                }
            });
            
            return selectedNotes;

        },
        delNotes: function(notes) {
            notes.forEach(function(id) {
                document.getElementById(`${id}`).parentNode.removeChild(document.getElementById(`${id}`));
            });
        },
        showFilterMenu: function() {
            document.querySelector('.filters').style.display = "flex";
        },
        hideFilterMenu:function() {
            document.querySelector('.filters').style.display = "none";
        },
        
        hideElement: function(el) {
            document.querySelector(el).style.display = "none";
        },
        renderToken:function(tag) {
            let el = `<span class="filters__token">${tag}</span>`;
            document.querySelector('.filters__label').insertAdjacentHTML('afterend', el );
        },
        clearTokens:function() {
            document.querySelectorAll('.filters__token').forEach(function(token) {
                token.parentNode.removeChild(token);
            });
        }

    }
 
})();


/////////////////////////////////////////////////////////////////
/// main controller module //////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////


const controller = (function(UI, data) {

    var filterNotes = function(tag) {
        //set state with tag
        data.state.currentFilter = tag;
        //show the filter menu in UI
        UI.showFilterMenu();
        //show filter token in UI
        UI.renderToken(data.state.currentFilter);
        //filter the visible notes in UI
        UI.filterNotes(data.filterNotes());
    };

    var clearFilters = function() {
        data.state.currentFilter = '';
        UI.clearFilters();
        UI.clearTokens();
        UI.hideFilterMenu();
    };

    var addNote = function() {
        //get input values
        var input = UI.getNoteInput();
        //check input value and if something go about adding note
        if (input.note !== '') {
            //reset input form
            UI.resetInput();
            //extract tags from note
            input = data.parseNote(input.note);
            //add to data model
            input = data.addNote(input);
            //reset UI filters 
            clearFilters();
            //add note to UI
            UI.insertNote(input);
        } else {
            // todo - throw error
        }
        
    };

    var enterDelMode = function() {
        data.state.delMode = true;
        UI.enterDelMode();
    };

    var delNotes = function() {
        // if in del mode 
        if(data.state.delMode) {
            data.state.delMode = false;
            var selected = UI.getSelected();
            UI.exitDelMode();
            data.delNotes(selected);
            UI.delNotes(selected);
        }
        

    };

    var init = function() {

        //create event listener for add button
        document.querySelector('.filters__clear').addEventListener('click', clearFilters);
        document.querySelector('#addBtn').addEventListener('click', UI.showInput);
        document.querySelector('#delBtn').addEventListener('click', enterDelMode);
        document.querySelector('#delSel').addEventListener('click', delNotes);

        

        //add event listener for hastags in notes
        document.querySelector('.viewer').addEventListener('click', function(){
            let target = event.target.closest('li');
                if(target) {
                    filterNotes(target.dataset.tag);
                } else { 
                    return;
                }
        });

        //create event listener to submit new note on enter key press
        window.addEventListener('keyup', function() {
        //log keycodes for testing
        
        //if 'enter' key pressed and input screen open, then add note
        if(event.keyCode === 13 && data.state.input === true) {
            addNote();
        }

        //enable 'n' as shortcut for opening input dialogue
        if(event.keyCode === 78 && data.state.input === false ) {
            UI.showInput();
        }

        });
        
    };

    return {
        init: init
    };

  
}(UIcontroller, data));


controller.init();



//Todo

// Filter system
    // menu
    // hashtag links XX
    // logic XX
    // filter tokens

// Deleting notes
    // delete note from data xx
    // delete note from UI xx


//Pretty up the UI


//nice to haves 
// //Keep hashtags in the middle of a note



// try and figure out the styling of the checkbox - dont forget to remove the event listener in the delmode function UI. 
