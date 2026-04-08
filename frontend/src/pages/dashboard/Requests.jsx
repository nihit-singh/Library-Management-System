import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import recordService from "../../services/recordService";
import "./requests.css";

function Requests() {
  const [data, setData] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const fetchRequests = async () => {
    const res = await recordService.getRequests();
    setData(res);
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchRequests();

  const interval = setInterval(() => {
    fetchRequests();
  }, 5000);

  return () => clearInterval(interval);
}, []);

const handleApprove = async (r) => {
  if (loadingId) return;

  setLoadingId(r.record_id);

  try {
    const res = await recordService.approveRequest({
      id: r.record_id,
      type: r.status,
      book_id: r.book_id,
    });

    console.log("APPROVE RESPONSE:", res);

    setData(prev => prev.filter(item => item.record_id !== r.record_id));

  } catch (err) {
    console.error("APPROVE ERROR:", err.response?.data || err);
  }

  setLoadingId(null);
};

const handleReject = async (id) => {
  try {
    const res = await recordService.rejectRequest(id);

    alert(res.message);

    setData(prev => prev.filter(item => item.record_id !== id));

  } catch (err) {
    console.error(err);
  }
};

  return (
    <>
      <Navbar />

      <div className="requests-container">
        <h2>Requests</h2>

        {data.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((r) => (
                <tr key={r.record_id}>
                  <td>{r.user_name}</td>
                  <td>{r.book_title}</td>

                  <td>
                    <span
                      className={`status ${
                        r.status === "pending_borrow"
                          ? "pending"
                          : "return"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="action-btn approve"
                      disabled={loadingId === r.record_id}
                      onClick={() => handleApprove(r)}
                    >
                      {loadingId === r.record_id ? "Processing..." : "Approve"}
                    </button>

                    <button
                      className="action-btn reject"
                      disabled={loadingId === r.record_id}
                      onClick={() => handleReject(r.record_id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Requests;