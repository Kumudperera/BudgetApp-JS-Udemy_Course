//Budget Controller
var budgetController = (function() {
    
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
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
        precentage: -1
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    }

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //[1, 2, 3, 4, 5] next ID = 6
            //[1, 2, 4, 6, 8] next ID = 9
            //ID = last ID + 1

            //Create New ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }else {
                ID = 0;
            }

            //Create new Iteam based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem);

            //Retrun the new element
            return newItem;
        },

        calculateBudget: function() {
            // calculate total lncome and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            // calculate the budget: incom - expenses
            data.budget = data.totals['inc'] - data.totals['exp'];
            // calculate the percentage of income that we spent

            // data.allItems['exp'].forEach(function(cur){
            //     (cur.value/(data.totals['inc'] + cur.value)) * 100;
            // })
            if(data.totals.exp > 0) {
                data.precentage = Math.round((data.totals.exp/data.totals.inc)*100);
            }else {
                data.precentage = -1;  
            }
            

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.precentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }
})();

//UI Controller
var UIController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        precentageLabel: '.budget__expenses--percentage'
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //praseFloat convert String into floating number
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Creat HTML string with placeholder text
            if(type === 'exp') {
                element = DOMstrings.expenseContainer;
                html ='<div class="item clearfix" id="expense-%id%">' +
                        '<div class="item__description">%description%</div>' +
                        '<div class="right clearfix">' +
                            '<div class="item__value">%value%</div>' +
                            '<div class="item__percentage">21%</div>' +
                            '<div class="item__delete">' +
                                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            } else if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%">' +
                        '<div class="item__description">%description%</div>' +
                        '<div class="right clearfix">' +
                            '<div class="item__value">%value%</div>' +
                            '<div class="item__delete">' +
                                '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%value%', obj.value);
            newHtml = newHtml.replace('%description%', obj.description);
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeEnd', newHtml);
        },

        clearFields: function() {
            var fields, fieldArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //This retrun a list

            fieldArr = Array.prototype.slice.call(fields); //Convert field list into fieldArr array

            fieldArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldArr[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.precentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.precentageLabel).textContent = '---';
            }
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();

//Global APP Controller
var Controller = (function(budgetCtrl, UIctrl) {

    var setupEventListners = function () {
        var DOM = UIctrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13) {
                console.log('Enter is pressed');
                ctrlAddItem();
            }
        });
    }

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        
        UIctrl.displayBudget({

        })
        console.log(budget);
    }
    
    var ctrlAddItem = function() {
        var newItem, input;

        //1. Get the field input data
        input = UIctrl.getInput();

        if(input.description != "" && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UIctrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UIctrl.clearFields();

            //5. Calculate the budget
            updateBudget();
        }
        

    }

    return {
        init: function () {
            console.log('Application has started');
            UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            })
            setupEventListners();
        }
    }
    

})(budgetController, UIController);

Controller.init();