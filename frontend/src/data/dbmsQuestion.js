const dbmsQuestions = [
  {
    question: "What does DBMS stand for?",
    options: [
      "Data Backup Management System",
      "Database Management System",
      "Database Monitoring System",
      "Data Management Software",
    ],
    answer: "Database Management System",
  },
  {
    question: "Which language is primarily used to interact with relational databases?",
    options: ["HTML", "SQL", "CSS", "Java"],
    answer: "SQL",
  },
  {
    question: "Which command is used to retrieve data from a database?",
    options: ["GET", "SELECT", "FETCH", "READ"],
    answer: "SELECT",
  },
  {
    question: "Which SQL command is used to add a new record?",
    options: ["INSERT", "ADD", "CREATE", "APPEND"],
    answer: "INSERT",
  },
  {
    question: "Which SQL command is used to modify existing records?",
    options: ["CHANGE", "MODIFY", "UPDATE", "ALTER"],
    answer: "UPDATE",
  },
  {
    question: "Which SQL command is used to remove records?",
    options: ["REMOVE", "DELETE", "DROP", "CLEAR"],
    answer: "DELETE",
  },
  {
    question: "Which command is used to create a new table?",
    options: ["MAKE TABLE", "NEW TABLE", "CREATE TABLE", "BUILD TABLE"],
    answer: "CREATE TABLE",
  },
  {
    question: "Which SQL clause is used to filter rows?",
    options: ["ORDER BY", "WHERE", "GROUP BY", "FILTER"],
    answer: "WHERE",
  },
  {
    question: "Which clause is used to sort query results?",
    options: ["SORT BY", "ORDER BY", "GROUP BY", "ARRANGE"],
    answer: "ORDER BY",
  },
  {
    question: "Which keyword removes duplicate rows from a result?",
    options: ["UNIQUE", "DISTINCT", "ONLY", "DIFFERENT"],
    answer: "DISTINCT",
  },
  {
    question: "Which key uniquely identifies each record in a table?",
    options: ["Foreign Key", "Primary Key", "Candidate Key", "Alternate Key"],
    answer: "Primary Key",
  },
  {
    question: "Which key establishes a relationship between two tables?",
    options: ["Primary Key", "Foreign Key", "Super Key", "Unique Key"],
    answer: "Foreign Key",
  },
  {
    question: "Can a primary key contain NULL values?",
    options: ["Yes", "No", "Only once", "Depends on the database"],
    answer: "No",
  },
  {
    question: "What is a row in a relational table called?",
    options: ["Attribute", "Tuple", "Field", "Domain"],
    answer: "Tuple",
  },
  {
    question: "What is a column in a relational table called?",
    options: ["Tuple", "Record", "Attribute", "Entity"],
    answer: "Attribute",
  },
  {
    question: "Which constraint prevents NULL values?",
    options: ["UNIQUE", "NOT NULL", "CHECK", "DEFAULT"],
    answer: "NOT NULL",
  },
  {
    question: "Which constraint ensures that values in a column are unique?",
    options: ["UNIQUE", "CHECK", "NOT NULL", "DEFAULT"],
    answer: "UNIQUE",
  },
  {
    question: "Which constraint is used to restrict values based on a condition?",
    options: ["CHECK", "LIMIT", "VERIFY", "CONDITION"],
    answer: "CHECK",
  },
  {
    question: "Which SQL clause groups rows with the same values?",
    options: ["GROUP BY", "ORDER BY", "WHERE", "COLLECT BY"],
    answer: "GROUP BY",
  },
  {
    question: "Which clause filters grouped results?",
    options: ["WHERE", "HAVING", "FILTER", "GROUP WHERE"],
    answer: "HAVING",
  },
  {
    question: "Which SQL function returns the number of rows?",
    options: ["SUM()", "COUNT()", "TOTAL()", "NUMBER()"],
    answer: "COUNT()",
  },
  {
    question: "Which SQL function calculates the average?",
    options: ["MEAN()", "AVG()", "AVERAGE()", "MID()"],
    answer: "AVG()",
  },
  {
    question: "Which SQL function calculates the total?",
    options: ["TOTAL()", "ADD()", "SUM()", "COUNT()"],
    answer: "SUM()",
  },
  {
    question: "Which SQL operation combines rows from related tables?",
    options: ["JOIN", "MERGE", "COMBINE", "CONNECT"],
    answer: "JOIN",
  },
  {
    question: "Which JOIN returns matching rows from both tables?",
    options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"],
    answer: "INNER JOIN",
  },
  {
    question: "Which JOIN returns all rows from the left table?",
    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"],
    answer: "LEFT JOIN",
  },
  {
    question: "What is normalization used for?",
    options: [
      "Increasing data duplication",
      "Reducing data redundancy",
      "Deleting all records",
      "Increasing table size",
    ],
    answer: "Reducing data redundancy",
  },
  {
    question: "Which normal form removes repeating groups?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: "1NF",
  },
  {
    question: "Which normal form removes partial dependency?",
    options: ["1NF", "2NF", "3NF", "4NF"],
    answer: "2NF",
  },
  {
    question: "Which normal form removes transitive dependency?",
    options: ["1NF", "2NF", "3NF", "5NF"],
    answer: "3NF",
  },
  {
    question: "What does ACID stand for in database transactions?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Accuracy, Control, Integrity, Data",
      "Access, Consistency, Isolation, Data",
      "Atomicity, Control, Integrity, Durability",
    ],
    answer: "Atomicity, Consistency, Isolation, Durability",
  },
];

export default dbmsQuestions;