import React, { useEffect, useState } from "react";
import { message, Table, Select, DatePicker, Pagination } from "antd";
import { BarsOutlined, AreaChartOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import Spinner from "../components/Spinner";
import DefaultLayout from "../components/DefaultLayout";
import AddEditTransaction from "../components/AddEditTransaction";
import moment from "moment";
import Analytics from "../components/Analytics";
const { RangePicker } = DatePicker;

function Home() {
  const [showAddEditTransactionModal, setShowAddEditTransactionModal] =
    useState(false);
    const [selectedItemForEdit, setSelectedItemForEdit] = useState (null)
  const [loading, setLoading] = useState(false);
  const [transactionsData, setTransactionsData] = useState([]);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [selectedRange, setselectedRange] = useState([]);
  const [viewType, setViewType] = useState("table");
  const getTransactions = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("lofi-user"));
      setLoading(true);
      const response = await axios.post(
        "/api/transactions/get-all-transactions",
        {
          userid: user._id,
          frequency,
          ...(frequency === "custom" && { selectedRange }),
          type,
        }
      );
      console.log(response.data);
      setTransactionsData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error("Something went wrong");
    }
  };


  const deleteTransaction = async (record) => {
    try {
      setLoading(true);
      await axios.post(
        "/api/transactions/delete-transaction",
        {
          transactionId : record._id
        }
      );
      message.success('Transaction Deleted Successfully')
      getTransactions();
      //setTransactionsData(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error("Something went wrong");
    }
  };

  useEffect(() => {
    getTransactions();
  }, [frequency, selectedRange, type]);

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => <span>{moment(date).format("YYYY-MM-DD")}</span>, //label can be used here instead of span
    },
    {
      title: "Amount",
      dataIndex: "amount",
    },
    {
      title: "Category",
      dataIndex: "category",
    },
    {
      title: "Reference",
      dataIndex: "reference",
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Actions",
      dataIndex: 'actions',
      render: (text, record) => {
        return <div>
          <EditOutlined onClick={ () => {
            setSelectedItemForEdit(record)
            setShowAddEditTransactionModal(true)
          }}/>
          <DeleteOutlined className="mx-3" onClick={() => deleteTransaction(record)}/>
        </div>
      }
    }
  ];

  return (
    <DefaultLayout>
      {loading && <Spinner />}
      <div className="filter d-flex justify-content-between align-items-center">
        <div className="d-flex flex-colum">
          <div className="d-flex flex-column">
            <h6>Select Frequency</h6>
            <Select value={frequency} onChange={(value) => setFrequency(value)}>
              <Select.Option value="7">Last 1 Week</Select.Option>
              <Select.Option value="30">Last 30 Days</Select.Option>
              <Select.Option value="365">Last 1 Year</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>

            {frequency === "custom" && (
              <div className="mt-2">
                <RangePicker
                  value={selectedRange}
                  onChange={(values) => setselectedRange(values)}
                />
              </div>
            )}
          </div>
          <div className="d-flex flex-column mx-5">
            <h6>Select Type</h6>
            <Select value={type} onChange={(value) => setType(value)}>
              <Select.Option value="all">All</Select.Option>
              <Select.Option value="expense">Expense</Select.Option>
              <Select.Option value="income">Income</Select.Option>
            </Select>
          </div>
        </div>

        <div className="d-flex">
          <div>
            <div className="view-switch mx-3">
              <BarsOutlined
                className={`mx-3 ${
                  viewType === "table" ? "active-icon" : "inactive-icon"
                }`}
                onClick = {()=>setViewType('table')}
              />
              <AreaChartOutlined
                className={`${
                  viewType === "analytics" ? "active-icon" : "inactive-icon"
                }`}
                onClick = {()=>setViewType('analytics')}
              />
            </div>
          </div>
        </div>

        <div>
          <button
            className="primary"
            onClick={() => setShowAddEditTransactionModal(true)}
          >
            ADD NEW
          </button>
        </div>
      </div>

      <div className="table-analytics">
        {viewType==='table' ? <div className="table">
            <Table columns={columns} dataSource={transactionsData} />
        </div> : <Analytics transactions = {transactionsData} />}

      </div>

      {showAddEditTransactionModal && (
        <AddEditTransaction
          showAddEditTransactionModal={showAddEditTransactionModal}
          setShowAddEditTransactionModal={setShowAddEditTransactionModal}
          selectedItemForEdit = {selectedItemForEdit}
          setSelectedItemForEdit = {setSelectedItemForEdit}
          getTransactions={getTransactions}
        />
      )}
    </DefaultLayout>
  );
}

export default Home;
