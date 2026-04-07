import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import transactionService from "../../services/transactionService";
import "./transactions.css";

function Transactions() {
  const [data, setData] = useState([]);

  const fetchTransactions = async () => {
    try {
      const res = await transactionService.getAllTransactions();
      setData(res);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  }, []);

  return (
    <>
      <Navbar />

      <div className="transactions-container">
        <h2>Transactions</h2>

        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Book</th>
              <th>Borrow</th>
              <th>Due</th>
              <th>Return</th>
              <th>Status</th>
              <th>Fine ₹</th>
            </tr>
          </thead>

          <tbody>
            {data.map((t) => (
              <tr key={t.transaction_id} >
                <td>{t.user_name}</td>
                <td>{t.book_title}</td>
                <td>{t.borrow_date?.split("T")[0]}</td>
                <td>{t.due_date?.split("T")[0]}</td>
                <td>
                  {t.return_date
                    ? t.return_date.split("T")[0]
                    : "Not Returned"}
                </td>
                <td>{t.status}</td>
                <td>{t.fine}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Transactions;