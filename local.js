class Page {
	constructor() {
		this.currentPage = 1;
	}

	handleEvent(event) {
		if (event.type != 'click') return;
		let selectedPage = event.target.closest('a').id[3];
		
		if (this.currentPage != selectedPage) {
			// Change content, but only if the page is not already open
			if (selectedPage!=2) {
			document.getElementById("aboutP").classList.toggle('isHidden');
			document.getElementById("formBig").classList.toggle('isHidden');
			}
			this.currentPage = selectedPage;
		}
		
	}

	setPage(number) { 
		this.currentPage = number; 
	}
}

class Calendar {
	constructor(elem) {
		this._elem = elem;
		this.m = elem.rows.length - 1
		this.n = elem.rows[0].cells.length -1
		elem.addEventListener('click',this.selectSlot);
	}

	selectSlot(event) {
		let td = event.target.closest('td');

		if (!td) return;

		if (page.currentPage!=1) return;

		// The cell selection can be inverted, if selectGreen is true, slots turn free when clicking
		let selectGreen = document.getElementById("radioFree").checked;
		if (selectGreen==true) {
			td.classList.toggle('free');
		} else {
			td.classList.toggle('occupied');
		}
	}

	tdFromIndex(index) {
		// Returns the td element with the specified index
		// Cells are ordered first by column then by row (same dates first)

		let col = Math.floor(index/this.m) + 1;
		let row = index%this.m + 1;
		console.log(this._elem.rows[row].cells[col])
		return this._elem.rows[row].cells[col];
	}

	getBinArray() {
		// returns the binary array of free slots
		let selectGreen = document.getElementById("radioFree").checked;
		console.log(selectGreen);
		let localArr = [];
	    for (var col = 1; col < this._elem.rows[0].cells.length; col++) {
	        for (var row = 1; row < this._elem.rows.length; row++){
	        	// Loops through all cells:
	            let currentCell = this._elem.rows[row].cells[col];
	            if (selectGreen==false) {
	        		localArr.push(Number(!currentCell.classList.contains('occupied')));
	        	} else {
	        		localArr.push(Number(currentCell.classList.contains('free')));
	        	}
	        }
	    }
	    return localArr;
	}

	getOverview() {
		// returns a html code of cells marked according to array of free slots
		let array = this.getBinArray()
		let overviewHtml = "";
		for(let state of array) {
			overviewHtml += '<td width="1px" class="'
			if (state==false) {
				overviewHtml += 'occupied'
			} else {
				overviewHtml += 'free'
			}
			overviewHtml += ' thin"></td>'
		}
		return overviewHtml
	}
	clean(elem) {
		if (elem.tagName == 'TD') {
			elem.classList.remove('occupied');
    		elem.classList.remove('free');
    		elem.classList.remove('winner');
		} else {
			for (let subElem of elem.childNodes) {
				this.clean(subElem)
			}
		}
	}
	cleanAll() {
		this.clean(this._elem)
	}
}

class Storage {
	constructor() {
		localStorage.setItem('storage', JSON.stringify([]));
		this.size = 0;
	}

	setStorage(object) {
		localStorage.setItem('storage', JSON.stringify(object));
	}

	storeSubmission(calendarObject) {
		this.size++
		let array = calendarObject.getBinArray();
		let post = {
			name: document.getElementById('nameInput').value,
			arr: array,
			// Sums the values in the array
			count: array.reduce((sum, current) => sum + current, 0)
		}

 		// Store in localStorage together with histogram, which is array 
  		// with current no of bookings of each time slot
		if (localStorage.getItem('storage') == "[]") {
	    	let storage = {
	    		posts: [post],
	    		histogram: post.arr,
	    	};
    		localStorage.setItem('storage', JSON.stringify(storage));
    		document.getElementById("postTable").style.visibility = "visible";
	  	} 
	  	else {
    		var storage = JSON.parse(localStorage.getItem('storage'));
    		storage.posts.push(post);
	    	for (var i=0; i<storage.histogram.length;i++) {
		    	storage.histogram[i] += post.arr[i]
	    	}
    	localStorage.setItem('storage', JSON.stringify(storage));
    	}
  	return post
	}

	computeOptimal() {
		// Returns a list of the indices with the highest number of "green" submissions
		if (this.size==0) {
			alert('No submissions made yet!');
    		return [];
  		}
		/*
	  	let hours = prompt("How many hours are needed for the occasion?",1);

	  	if(!Number.isInteger(hours)) { // Default value if bad answer is received
	  		hours = 1;
	  	}
	  	*/
	  	let hours = 1;

		// histogram is array with no of bookings of each time slot
		let histogram = JSON.parse(localStorage.getItem('storage')).histogram;

		// Find largest element in list
		let largestVal = [0];
		// largestInd contains the indices with highest no. of bookings
		let largestInd = [];

		for (let i=0;i<histogram.length;i++){

			if (histogram[i]>largestVal[0]) {
				largestVal = [histogram[i]];
				largestInd = [i];
			} else if (histogram[i]==largestVal[0]) {
				largestVal.push(histogram[i]);
				largestInd.push(i);
			}
		}

		return largestInd
	}
}

class List {
	constructor(elem) {
		this._elem = elem;
	}

	add(name,count,html) {
		if (name == "") name = "No name";
		this._elem.innerHTML += '<tr><td>'+name+'</td><td>'+count+'</td>'+html+'</tr>';
		this._elem.parentElement.style.visibility = "visible";
	}

	clear() {
		this._elem.innerHTML = "";
		this._elem.parentElement.style.visibility = "hidden";
	}
}

// BROWSER EVENTS AND OBJECTS
let page = new Page();
let mainCal = new Calendar(document.getElementById('calendar'));
let mainStor = new Storage();
let mainList = new List(document.getElementById('postList'))

nav1.addEventListener('click',page);
nav3.addEventListener('click',page);

nav2.addEventListener('click',function resultView(e) {
	// Highlight the most available cells
	let bestIdx = mainStor.computeOptimal();
	bestIdx.forEach((value) => mainCal.tdFromIndex(value).classList.add('winner'));
});

buttons.addEventListener('click',function resetHandler(e) {
	page.setPage(1);
	mainCal.cleanAll();
	document.getElementById('occForm').reset();
});

submitBtn.addEventListener('click',function submitHandler(e) {
	if (page.currentPage==2) return; // When showing results, submit button doesn't work
	post = mainStor.storeSubmission(mainCal);
	html = mainCal.getOverview();
	mainList.add(post.name,post.count,html)
});

clearBtn.addEventListener('click',function clearHandler(e) {
	mainStor.setStorage([]);
	mainList.clear();
});





	
