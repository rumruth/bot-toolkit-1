class Verbose {
	constructor(element) { 
		this.elem = element;
    	this.body = element.find(">:last-child");
    	this.hidden = true;
	}
	line(msg){ if (!this.hidden) $(this.body).append(msg); }
	newline(msg){ if (!this.hidden) $(this.body).append(this.stamp + " " + msg + "<br>"); }
	get stamp(){
	  var d = new Date();
	  return `[${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}]`;
	}
	show(){ 
		this.elem.show();
		this.hidden = false;
	}
	hide(){ 
		this.elem.hide();
		this.hidden = true;
	}
}
module.exports = Verbose;