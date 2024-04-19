import React, { useState } from "react";
import { Progress, Button } from "antd";
import "../resources/analytics.css";
import Budget from "./Budget";
import { useBudget } from "../context/BudgetContext";

function Analytics({ transactions }) {
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const { budgets, saveBudget, deleteBudget } = useBudget();

  const totalTransactions = transactions.length;
  const totalIncomeTransactions = transactions.filter(
    (transaction) => transaction.type === "income"
  );
  const totalExpenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense"
  );

  const totalIncomeTurnover = totalIncomeTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );
  const totalExpenseTurnover = totalExpenseTransactions.reduce(
    (acc, transaction) => acc + transaction.amount,
    0
  );

  const totalProfit = (totalIncomeTurnover - totalExpenseTurnover).toFixed(2);

  const totalBudget = Object.values(budgets).reduce(
    (sum, { amount }) => sum + Number(amount),
    0
  );
  //const totalBudgetProgress = totalExpenseTurnover / totalBudget * 100;

  const overallBudget = budgets["all"]?.amount ?? 0;
  const overallProgress =
    overallBudget > 0
      ? ((totalExpenseTurnover / overallBudget) * 100).toFixed(0)
      : 0;

  const categories = [
    "salary",
    "freelance",
    "food",
    "travel",
    "entertainment",
    "medical",
    "education",
    "investment",
    "sport",
    "gift",
    "transport",
    "house",
    "government",
  ];

  const handleBudgetClick = () => {
    setIsBudgetModalVisible(true);
  };

  const handleBudgetClose = () => {
    setIsBudgetModalVisible(false);
  };

  const handleBudgetSave = (values) => {
    setIsBudgetModalVisible(false);
    saveBudget(values);
  };

  const handleBudgetDelete = (category) => {
    deleteBudget(category);
  };

  return (
    <div className="analytics">
      <div className="row">
        <div className="col-md-6 mt-3">
          <div className="transactions-count mx-5">
            <h4>Total Transactions: {totalTransactions}</h4>
            <hr />
            <h5>Income: {totalIncomeTransactions.length}</h5>
            <h5>Expense: {totalExpenseTransactions.length}</h5>

            <Budget
              visible={isBudgetModalVisible}
              onClose={handleBudgetClose}
              onSave={handleBudgetSave}
            />
          </div>
        </div>

        <div className="col-md-6 mt-3">
          <div className="transactions-count mx-5">
            <h4>Analytics</h4>
            <hr />
            <h5>Total Income: {totalIncomeTurnover}</h5>
            <h5>Total Expense: {totalExpenseTurnover}</h5>
            <h5>Total Profit: {totalProfit}</h5>
            <div>
              <h5>Total Budget: {budgets["all"]?.amount}</h5>{" "}
            </div>
            <div className="row mt-3">
              <div className="col-md-12 mt-3">
                <button className="btn btn-primary" onClick={handleBudgetClick}>
                  Set Budget
                </button>
              </div>
            </div>
            <Button onClick={() => handleBudgetDelete(["all"])}>
              Delete Budget
            </Button>
            {budgets["all"] && (
              <Progress
                type="circle"
                strokeColor={
                  totalExpenseTurnover <= overallBudget ? "#D507FD" : "#FF6347"
                }
                percent={
                  totalExpenseTurnover > overallBudget
                    ? ((overallBudget / totalExpenseTurnover) * 100).toFixed(0)
                    : overallProgress
                }
                status={
                  totalExpenseTurnover <= overallBudget ? "normal" : "active"
                }
                showInfo={true}
              />
            )}
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-md-6">
          <div className="category-analysis">
            <h4>Income - Category Wise</h4>
            {categories.map((category) => {
              const amount = transactions
                .filter((t) => t.type === "income" && t.category === category)
                .reduce((acc, t) => acc + t.amount, 0);
              return (
                amount > 0 && (
                  <div className="category-card">
                    <h5>{category}</h5>
                    <h5> total: {amount}</h5>
                    <Progress
                      strokeColor="#D507FD"
                      percent={((amount / totalIncomeTurnover) * 100).toFixed(
                        0
                      )}
                    />
                  </div>
                )
              );
            })}
          </div>
        </div>
        <div className="col-md-6">
          <div className="category-analysis">
            <h4>Expense - Category Wise</h4>
            {categories.map((category) => {
              const transactionsForCategory = transactions.filter(
                (t) => t.type === "expense" && t.category === category
              );
              const amount = transactionsForCategory.reduce(
                (acc, t) => acc + t.amount,
                0
              );
              const budget = budgets[category];
              const progressPercentage = budget
                ? amount <= Number(budget.amount)
                  ? ((amount / Number(budget.amount)) * 100).toFixed(0) // if within budget, show the usage percentage
                  : (
                      ((amount - Number(budget.amount)) /
                        Number(budget.amount)) *
                      100
                    ).toFixed(0) // if exceeding budget, show excess percentage
                : 0; // default to 0 if no budget is set

              return (
                amount > 0 && (
                  <div className="category-card" key={category}>
                    <h5>{category}</h5>
                    <h5>Expenses: {amount}</h5>
                    {budget && (
                      <>
                        <h5>Budget: {budget.amount}</h5>
                        <Progress
                          strokeColor={
                            amount > Number(budget.amount)
                              ? "#FF6347"
                              : "#D507FD"
                          } // Red when amount exceeds budget, purple otherwise
                          percent={progressPercentage} // percentage calculated based on the condition
                          status={
                            amount <= Number(budget.amount)
                              ? "normal"
                              : "active"
                          } // 'exception' when amount exceeds budget
                          showInfo={true}
                        />
                        <Button onClick={() => handleBudgetDelete(category)}>
                          Delete Budget
                        </Button>
                      </>
                    )}
                    {!budget && (
                      <Progress
                        strokeColor="#D507FD"
                        percent={((amount / totalIncomeTurnover) * 100).toFixed(
                          0
                        )}
                        status="normal"
                        showInfo={true}
                      />
                    )}
                  </div>
                )
              );
            })}
          </div>
        </div>
      </div>
      <Budget
        visible={isBudgetModalVisible}
        onClose={handleBudgetClose}
        onSave={handleBudgetSave}
      />
    </div>
  );
}

export default Analytics;
