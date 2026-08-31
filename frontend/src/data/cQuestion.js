const cQuestions = [
  {
    question: "Which function is the entry point of a C program?",
    options: ["start()", "main()", "run()", "execute()"],
    answer: "main()",
  },
  {
    question: "Which symbol is used to end a statement in C?",
    options: [".", ":", ";", ","],
    answer: ";",
  },
  {
    question: "Which header file is required for printf()?",
    options: ["stdlib.h", "string.h", "stdio.h", "math.h"],
    answer: "stdio.h",
  },
  {
    question: "Which function is used to print output in C?",
    options: ["print()", "printf()", "display()", "cout"],
    answer: "printf()",
  },
  {
    question: "Which function is commonly used to read formatted input?",
    options: ["input()", "scanf()", "read()", "cin"],
    answer: "scanf()",
  },
  {
    question: "Which data type is used to store a single character?",
    options: ["string", "char", "character", "text"],
    answer: "char",
  },
  {
    question: "Which data type is used to store decimal values?",
    options: ["int", "char", "float", "void"],
    answer: "float",
  },
  {
    question: "Which data type is normally used to store whole numbers?",
    options: ["int", "float", "char", "double"],
    answer: "int",
  },
  {
    question: "Which operator is used to get the address of a variable?",
    options: ["*", "&", "#", "@"],
    answer: "&",
  },
  {
    question: "Which operator is used to access the value stored at a pointer address?",
    options: ["&", "*", "#", "->"],
    answer: "*",
  },
  {
    question: "What is a pointer in C?",
    options: [
      "A variable that stores an address",
      "A function",
      "A constant",
      "A data type only",
    ],
    answer: "A variable that stores an address",
  },
  {
    question: "Which symbol is used for a single-line comment in C?",
    options: ["//", "#", "<!--", "--"],
    answer: "//",
  },
  {
    question: "Which symbol is used for a multi-line comment?",
    options: ["//", "/* */", "#", "<>"],
    answer: "/* */",
  },
  {
    question: "Which keyword is used to define a constant?",
    options: ["constant", "const", "fixed", "final"],
    answer: "const",
  },
  {
    question: "Which keyword is used to return a value from a function?",
    options: ["send", "return", "output", "result"],
    answer: "return",
  },
  {
    question: "Which loop is guaranteed to execute at least once?",
    options: ["for", "while", "do-while", "if"],
    answer: "do-while",
  },
  {
    question: "Which statement is used to stop a loop?",
    options: ["stop", "exit", "break", "end"],
    answer: "break",
  },
  {
    question: "Which statement skips the current iteration?",
    options: ["skip", "continue", "pass", "next"],
    answer: "continue",
  },
  {
    question: "Which keyword is used for conditional branching?",
    options: ["if", "check", "when", "condition"],
    answer: "if",
  },
  {
    question: "Which statement provides an alternative when if is false?",
    options: ["otherwise", "else", "default", "alternative"],
    answer: "else",
  },
  {
    question: "Which statement is useful for multiple conditions?",
    options: ["switch", "choose", "select", "caseonly"],
    answer: "switch",
  },
  {
    question: "Which keyword is used inside a switch statement?",
    options: ["option", "case", "choice", "when"],
    answer: "case",
  },
  {
    question: "Which keyword prevents execution from falling through to the next case?",
    options: ["stop", "break", "exit", "return"],
    answer: "break",
  },
  {
    question: "Which data structure stores elements of the same type sequentially?",
    options: ["Array", "Structure", "Pointer", "Function"],
    answer: "Array",
  },
  {
    question: "What is the index of the first element of a C array?",
    options: ["0", "1", "-1", "Depends on the array"],
    answer: "0",
  },
  {
    question: "Which function is used to find the length of a string?",
    options: ["length()", "strlen()", "strlength()", "size()"],
    answer: "strlen()",
  },
  {
    question: "Which header file contains string functions such as strlen()?",
    options: ["stdio.h", "stdlib.h", "string.h", "math.h"],
    answer: "string.h",
  },
  {
    question: "Which function is used to allocate memory dynamically?",
    options: ["alloc()", "malloc()", "memory()", "new()"],
    answer: "malloc()",
  },
  {
    question: "Which function releases dynamically allocated memory?",
    options: ["delete()", "remove()", "free()", "release()"],
    answer: "free()",
  },
  {
    question: "Which keyword is used to define a structure?",
    options: ["record", "struct", "structure", "object"],
    answer: "struct",
  },
  {
    question: "Which preprocessor directive is used to include a header file?",
    options: ["#include", "#header", "#import", "#using"],
    answer: "#include",
  },
];

export default cQuestions;