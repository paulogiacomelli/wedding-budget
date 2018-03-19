// BUGDET CONTROLLER
var budgetController = (function () {
	
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	
	Expense.prototype.calcPercentage = function(totalIncome) {
		if(totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};
	
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	var calculateTotal = function(type) {
		var sum = 0;
		// Callback function
		data.allItems[type].forEach(function(item) {
			sum += item.value;
		});
		
		data.totals[type] = sum;
	};
	
	
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	
	return {
		addItem: function(type, des, val) {
			var newItem;
			var ID;
			
			// ID = last ID + 1
			// Create new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			
			// Create the new item based on type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if(type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			
			// Add to the array data structure
			data.allItems[type].push(newItem);
			
			// return the new element
			return newItem;
		},
		
		deleteItem: function(type, id) {
			var ids, index;
			// id = 6;
			// ids [1 2 4 6 8]
			// index = 3
			
			// Find item
			ids = data.allItems[type].map(function(cur) {
				return cur.id;
			});
			
			index = ids.indexOf(id);
			
			// Delete item
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		
		testing: function() {
			console.log(data);
		},
		
		calculateBudget: function() {
			// Calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');
			
			// Calculate budget: income - exp
			data.budget = data.totals.inc - data.totals.exp;
			
			// Calculate percentage
			
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},
		
		calculatePercentages: function() {
			// Every object will have a percentage after calculated
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},
		
		
		getPercentages: function() {
			// Returns an array of all percentages of the expenses
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
			return allPerc;
		},
		
		getBudget: function() {
			return {
				budget: data.budget,
				percentage: data.percentage,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp
			};
		},
		
		
	};
	
})();

// UI CONTROLLER
var UIController = (function () {
	
	var DOMstrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	
	};
	
	var formatNumber = function(num, type) {
			var numSplit, int, decimal;
			
			// + or - before the number
			// 2 decimal points
			// comma separting the thousands
			
			num = Math.abs(num);
			num = num.toFixed(2); // Round decimal
			
			numSplit = num.split('.');
			
			int = numSplit[0];
			
			if(int.length > 3) {
				int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, int.length); // input: 2310, output 2,310
			}
			
			decimal = numSplit[1];
			
			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + decimal;
	};
	
	var nodeListForEach = function(list, callback) {
			for (var i = 0; i < list.length; i++) {
				callback(list[i], i);
			}	
		};

	return {
		getInput: function () {
			return {
				type: document.querySelector(DOMstrings.inputType).value, // Will be inc or exp
				description: document.querySelector(DOMstrings.inputDesc).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},
		
		addListItem: function(obj, type) {
			var html, newHtml, element;
			// Create html string w/ placeholder text
			
			if (type === 'inc'){
				 element = DOMstrings.incomeContainer;
				 html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				 element = DOMstrings.expensesContainer;
				 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			// Replace the placeholder text with some actual data
			
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			
			// Insert the html into the DOM
			document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
			
			
		},
		
		deleteListItem: function(selectorID) {
			var element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},
		
		clearFields: function() {
			var fields, fieldsArray;
			
			fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValue);
			
			fieldsArray = Array.prototype.slice.call(fields);
			
			fieldsArray.forEach(function(current) {
				current.value = "";
			});
			
			fieldsArray[0].focus(); // Sets back to description
			
		},
		
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
			
		},
		
		displayPercentages: function(percentages) {
			
			// nodeList
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
			
			nodeListForEach(fields, function(cur, index) {
				
				if (percentages[index] > 0) {
					cur.textContent = percentages[index] + '%';
				} else {
					cur.textContent = '---';
				}
			});
			
		},
		
		displayDate: function() {
			var now, year, month, months;
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October','November','Decemeber'];
			now = new Date();	
			year = now.getFullYear();
			month = now.getMonth();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		
		changeType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDesc + ',' +
				DOMstrings.inputValue
			);
			
			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});
			
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMStrings: function () {
			return DOMstrings;
		},
		
	};
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

	var setEventListeners = function () {
		var DOM = UICtrl.getDOMStrings();
		
		// Add button event listener
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		// Add keypress button listener
		document.addEventListener('keypress', function (event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});
		
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
		
	};
	
	var updateBudget = function() {
				
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();
		
		// 2. return the budget
		var budget = budgetCtrl.getBudget();
		
		// 3. Display the budget on UI
		UICtrl.displayBudget(budget);
		
	};
	
	var updatePercentages = function() {
		// 1. Calculate the percentages
		budgetCtrl.calculatePercentages();
		
		// 2. Read percentages from BudgetCtrl
		var percentages = budgetCtrl.getPercentages();
		
		// 4. Update UI
		UICtrl.displayPercentages(percentages);
	}

	var ctrlAddItem = function () {
		var input, newItem;
		// 1. Get the filed input data
		input = UICtrl.getInput();
		
		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the bugdet controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear Fields
			UICtrl.clearFields();

			// 5. Calculate/Update Budget
			updateBudget();
			
			// 6. Calcuclate/Update Percentages
			updatePercentages();
		}
	

	};
	
	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(itemID) {
			//inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = splitID[1];
			
			// 1. Delete item from the data structure
			budgetCtrl.deleteItem(type, parseInt(ID));
			
			// 2. Delete item from the UI
			UICtrl.deleteListItem(itemID);
			
			// 3. Update and show the new budget
			updateBudget();
			
			// 6. Calcuclate/Update Percentages
			updatePercentages();
			
		}
	}
	
	return {
		init: function() {
			console.log("app started");
			UICtrl.displayDate();
			UICtrl.displayBudget({
				budget: 0,
				percentage: 0,
				totalInc: 0,
				totalExp: 0
			});
			setEventListeners();
		}
	}

})(budgetController, UIController);

controller.init();