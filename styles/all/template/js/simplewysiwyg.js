window.senky_simplewysiwyg_editor = CKEDITOR.replace('message', {
	customConfig: false,
	stylesSet: false,
	toolbar: [
		{ items: ['Undo', 'Redo'] },
		{ items: ['Bold', 'Italic', 'Underline', senky_simplewysiwyg_quote ? 'Blockquote' : true, 'CodeSnippet', 'NumberedList', 'BulletedList', senky_simplewysiwyg_img ? 'Image' : true, senky_simplewysiwyg_url ? 'Link' : true, senky_simplewysiwyg_url ? 'Unlink' : true, 'TextColor', 'FontSize'] },
		{ items: [ 'Find', 'Replace', '-', 'SelectAll', 'RemoveFormat' ] },
		{ items: ['Source'] },
	],
	contentsCss: [
		CKEDITOR.basePath + '../../../theme/contents.css',
		CKEDITOR.basePath + '../../../../../../../../assets/css/font-awesome.min.css'
	],
	language: senky_simplewysiwyg_lang,
	disableNativeSpellChecker: false,

	// autogrow
	autoGrow_minHeight: 280,
	autoGrow_onStartup: true,

	// font
	fontSize_sizes: senky_simplewysiwyg_fontSize_sizes,

	// codesnippet
	codeSnippet_languages: {},

	// smiley
	smiley_images: senky_simplewysiwyg_smiley_images,
	smiley_descriptions: senky_simplewysiwyg_smiley_descriptions,
	smiley_path: senky_simplewysiwyg_smiley_path,
});

// hide original BBcode buttons once CKEditor is initialised
window.senky_simplewysiwyg_editor.once('instanceReady', function() {
	var buttons = document.getElementById('format-buttons');
	// --- ADDED by Attila Szabó (aszpirin72@gmail.con) 02/13/2023
	// instead of deleting all the buttons, we leave the buttons of visible user-defined BBcodes in place
	// these are all placed after the select box in the editor's DOM, so we delete everything before and including the select box 
	var lastButtonTag = '';
	while (buttons.firstChild && (lastButtonTag !== 'SELECT')) { 
		lastButtonTag = buttons.firstChild.nodeName;
		buttons.removeChild(buttons.firstChild); 
	}
    // -- END of a added code by Attila Szabó 
    // -- DELETED by Attila Szabó on 02/13/2023
	// no need for removing the parent element of the BBCode buttons
	//	buttons.parentElement.removeChild(buttons);
});

// replaces function defined in assets/javascript/editor.js
window.insert_text = function(text, spaces) {
	if (spaces) {
		text = ' ' + text + ' ';
	}

	if (senky_simplewysiwyg_editor.mode == 'source') {
		var sourceTextarea = senky_simplewysiwyg_editor.container.$.querySelector('.cke_source');
		var caretPos = sourceTextarea.selectionStart;
		var value = sourceTextarea.value;

		sourceTextarea.value = value.substring(0, caretPos) + text + value.substring(caretPos);
	} else {
		var html = CKEDITOR.BBCodeToHtml(text);
		senky_simplewysiwyg_editor.insertHtml(html);
	}
};

// replaces function defined in assets/javascript/plupload.js
phpbb.plupload.updateBbcode = function(action, index) {
	var editor = senky_simplewysiwyg_editor,
		text = editor.getData(),
		removal = (action === 'removal');

	// Return if the bbcode isn't used at all.
	if (text.indexOf('[attachment=') === -1) {
		return;
	}

	function runUpdate(i) {
		var regex = new RegExp('\\[attachment=' + i + '\\](.*?)\\[\\/attachment\\]', 'g');
		text = text.replace(regex, function updateBbcode(_, fileName) {
			// Remove the bbcode if the file was removed.
			if (removal && index === i) {
				return '';
			}
			var newIndex = i + ((removal) ? -1 : 1);
			return '[attachment=' + newIndex + ']' + fileName + '[/attachment]';
		});
	}

	// Loop forwards when removing and backwards when adding ensures we don't
	// corrupt the bbcode index.
	var i;
	if (removal) {
		for (i = index; i < phpbb.plupload.ids.length; i++) {
			runUpdate(i);
		}
	} else {
		for (i = phpbb.plupload.ids.length - 1; i >= index; i--) {
			runUpdate(i);
		}
	}

	if (editor.mode == 'source') {
		editor.container.$.querySelector('.cke_source').value = text;
	} else {
		editor.setData(text);
	}
};
