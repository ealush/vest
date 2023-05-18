---
sidebar_position: 3
title: Comparing Vest to Other Form Validation Libraries
description: Explore the unique features of Vest and how it stands out among other form validation libraries.
keywords:
  [
    form validation,
    Vest,
    library comparison,
    functional matchers,
    schema validation,
    developer experience,
    user experience,
    performance,
    vestjs,
    zod,
    joi,
    yup,
    redux-forms,
    formik,
  ]
---

# Comparing Vest to Other Form Validation Libraries

## Vest vs. the Rest

When comparing Vest to other form validation libraries, it's important to understand the different types of libraries available and their respective strengths and weaknesses.

**1. Functional Matchers:**
Functional matchers are the most basic form validation libraries. They consist of functions that return a Boolean value based on whether a value meets certain criteria. While these libraries are essential, they lack the structure required for complex form validation scenarios.

Notable libraries in this category include **v8n** and **validatorjs**.

**2. Schema Validation:**
Schema validation libraries extend the concept of functional matchers by allowing developers to specify the shape of the entire dataset. A schema validator ensures that the data conforms to the defined schema. While this provides some structure, it may not be efficient for client-side use, because it requires validating the whole schema while users type into field-by-field. Additionally, describing complex scenarios and handling partial form validation can be challenging with schema validators.

Notable libraries in this category include **yup**, **joi**, and **zod**.

**3. Framework-Specific Form State Managers:**
These libraries have gained popularity in recent years. They integrate with UI frameworks and handle form state, interactions, and validations. While they offer mature solutions for client-side use, they often come with limitations. They are tied to specific frameworks or tech stacks, making it difficult to share validation code across teams or switch frameworks without significant refactoring.

Notable libraries in this category include **Formik**, **Vuelidate**, **vee-validate**, and **redux-forms**.

**How does Vest compare to them?**

| Features                         | Vest                      | Functional Matchers | Schema Validation   | Framework-Specific Form State Managers       |
| -------------------------------- | ------------------------- | ------------------- | ------------------- | -------------------------------------------- |
| Stateful                         | Stateful                  | Manual              | Manual              | Stateful                                     |
| Per Field Validation             | Supported                 | Not supported       | Not supported       | Supported                                    |
| Syntax                           | Declarative               | Function calls      | Declarative         | Declarative                                  |
| Code Organization                | Separate validation suite | Manual organization | Manual organization | Depends on library                           |
| Framework Agnostic               | Yes                       | Yes                 | Yes                 | No                                           |
| Flexibility for Framework Switch | High                      | High                | High                | Limited                                      |
| Code Reusability                 |                           | It's functions...   | Requires effort     | Within the UI Framework                      |
| Libraries                        | -                         | v8n, validatorjs    | yup, joi, zod       | Formik, Vuelidate, vee-validate, redux-forms |

Vest is a new breed of form validation library that tries to answer the shortcomings of existing solutions, while not compromising on developer experience, user experience and performance. Here's how Vest stands out:

1. **Stateful:** Vest manages the state of validated fields internally, eliminating the need for developers to manually track field states. It takes care of merging states and handling interactivity seamlessly.

2. **Selective Field Validation:** Vest allows developers to run validations only on specific fields upon interaction. This eliminates the need to exclude untouched fields from validation results.

3. **Simple and Declarative Syntax:** Vest adopts a straightforward, unit-test-like syntax that is easy to read, write, and maintain. This simplicity enhances developer productivity.

4. **Separate Validation Suite:** Vest keeps the validation code separate from the feature code, enabling better code organization and decoupling. This separation promotes code reuse and maintainability.

5. **Framework Agnostic:** Vest is designed to be framework agnostic, allowing developers to reuse Vest validations across teams and different parts of their products. It provides the flexibility to rewrite the entire application with a different framework without needing to modify the validation code.

With its emphasis on improved developer experience, user experience, and performance, Vest offers a compelling alternative to existing form validation libraries.
