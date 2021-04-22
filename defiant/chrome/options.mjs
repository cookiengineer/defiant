
import { Element } from '../design/Element.mjs';



const console = chrome.extension.getBackgroundPage().console || window.console;
const DEFIANT = chrome.extension.getBackgroundPage().DEFIANT || null;



if (DEFIANT !== null) {

	// TODO: Render Options Page and integrate change events
	console.log(DEFIANT.settings);

}

