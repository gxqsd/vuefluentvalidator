/*!
 * Gxqsd.Validator v0.1 
 */
class Validator {
    constructor({ model, rule = undefined }) {

        this.fieldValidationSet = new Map();

        if (rule.constructor.name === "Function") {
            rule(this);
        }

        this.model = model.constructor.name === "Function" ? new model() : model;

        this.model.error = {
            code: '',
            clearValue: function () {
                for (const key in this) {
                    if (this.hasOwnProperty(key) && key !== 'clearValue' && key !== 'exist') {
                        this[key] = '';
                    }
                }
            },
            exist: function () {
                let exist = false;
                for (const key in this) {
                    if (this.hasOwnProperty(key) && key !== 'clearValue' && key !== 'exist') {
                        if (this[key] !== '') {
                            exist = true;
                            break;
                        }
                    }
                }
                return exist;
            }
        };

        for (const key in this.model) {
            if (this.model.hasOwnProperty(key) && key !== 'error') {
                this.model.error[key] = '';
            }
        }



    }

    ruleFor(field) {   //此处表达式返回一个指定字段哈
        //  验证配置以字段作为唯一单位，每个字段对应一个初始化器
        this.fieldValidationSet.set(field, new RuleBuilderInitial());
        return this.fieldValidationSet.get(field);
    }

    validation(targetElement) {
        this.model.error.clearValue();
        for (const [field, initial] of this.fieldValidationSet) {

            const property = this.model[field];
            for (const [config, options] of initial.validationSet) {
                switch (config) {
                    case "NotEmpty":
                        if (!property) {
                            this.model.error[field] = initial.validationSet.get("NotEmpty").errorMessage;
                        }
                        break;
                    case "MinimumLength":
                        if (property && initial.minimumLength) {
                            if (property.length < initial.minimumLength) {
                                this.model.error[field] = initial.validationSet.get("MinimumLength").errorMessage;
                            }
                        }
                        break;
                    case "MaximumLength":
                        if (property && initial.maximumLength) {
                            if (property.length > initial.minimumLength) {
                                this.model.error[field] = initial.validationSet.get("MaximumLength").errorMessage;
                            }
                        }
                        break;

                    case "Length":
                        if (property && initial.length) {
                            if (property.length > initial.length["max"] || property.length < initial.length["min"]) {
                                this.model.error[field] = initial.validationSet.get("Length").errorMessage;
                            }
                        }
                        break;
                    case "Must":
                        if (property && initial.must && this.model) {
                            if (initial.must(this.model)) {
                                console.log(field);
                                this.model.error[field] = initial.validationSet.get("Must").errorMessage;
                            }
                        }
                        break;
                    case "Number":

                        let propertyNum = Number(property);

                        if (property && !isNaN(propertyNum) && initial.number) {
                            if (propertyNum > initial.number.max || propertyNum < initial.number.min) {
                                this.model.error[field] = initial.validationSet.get("Number").errorMessage;
                            }
                        } else {
                            this.model.error[field] = "必须是Number类型";
                        }
                        break;
                }
            }
        }
        if (!this.model.error.exist()) {    //没有错误
            this.model.error.code = -2; //通过验证
            targetElement.click();  //  重新触发submit
        }
    }

    passValidation() {
        return this.model.error.code === -2 ? true : false;
    }
}

class RuleBuilderOptions {

    constructor(initial) {
        this.errorMessage = '';
        this.ruleBuilderInitial = initial;
    }

    WithMessage(errorMessage) {
        this.errorMessage = errorMessage;
        return this.ruleBuilderInitial;
    }

}

class RuleBuilderInitial {

    constructor() {   // T：验证的目标类型 TProperty：验证的属性类型
        //  以具体的验证方式作为唯一单位
        this.validationSet = new Map();
        this.length = undefined;
        this.must = undefined;
        this.maximumLength = undefined;
        this.minimumLength = undefined;
        this.number = undefined;
    }

    /*
     *  非空
     */
    NotEmpty() {
        this.validationSet.set("NotEmpty", new RuleBuilderOptions(this));
        return this.validationSet.get('NotEmpty');
    }
    Length(min, max) {
        this.validationSet.set("Length", new RuleBuilderOptions(this));
        this.length = { min: min, max: max };
        return this.validationSet.get("Length");
    }
    Must(expression) {
        this.validationSet.set("Must", new RuleBuilderOptions(this));
        this.must = expression;
        return this.validationSet.get("Must");
    }
    EmailAddress() {
        this.validationSet.set("EmailAddress", new RuleBuilderOptions(this));
        return this.validationSet.get('EmailAddress');
    }
    MaximumLength(max) {
        this.validationSet.set("MaximumLength", new RuleBuilderOptions(this));
        this.maximumLength = max;
        return this.validationSet.get('MaximumLength');
    }
    MinimumLength(min) {
        this.validationSet.set("MinimumLength", new RuleBuilderOptions(this));
        this.minimumLength = min;
        return this.validationSet.get('MinimumLength');
    }
    Number(min, max) {
        this.validationSet.set("Number", new RuleBuilderOptions(this));
        this.number = { min: min, max: max };
        return this.validationSet.get("Number");
    }
}