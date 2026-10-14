
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function OrganizerScanner() {
  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const scanHandlingRef = useRef(false);

  const [scannerRunning, setScannerRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [manualCode, setManualCode] = useState("");

  async function verifyTicket(rawCode) {
    const ticketCode = rawCode.trim();

    if (!ticketCode || processingRef.current) return;

    processingRef.current = true;
    setProcessing(true);
    setMessage("");
    setResult(null);

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please log in with your organizer account.");
      }

      const response = await fetch(`${API_URL}/tickets/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticket_code: ticketCode,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "Ticket verification failed.";

        setResult({
          success: false,
          title:
            response.status === 404
              ? "Ticket Not Found"
              : response.status === 403
                ? "Access Denied"
                : "Check-in Failed",
          message: detail,
        });

        return;
      }

      setResult({
        success: true,
        title: "Check-in Successful!",
        message: `Ticket ${data.ticket_code} has been checked in.`,
        ticket: data,
      });

      setManualCode("");
    } catch (error) {
      setResult({
        success: false,
        title: "Unable to Verify Ticket",
        message:
          error.message || "Please check your connection and try again.",
      });
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  }

  async function startScanner() {
    if (starting || scannerRunning) return;

    setStarting(true);
    setMessage("");
    setResult(null);

    try {
      const scanner = new Html5Qrcode("eventmesh-qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (scanHandlingRef.current || processingRef.current) return;

          scanHandlingRef.current = true;

          try {
            scanner.pause(true);
            await verifyTicket(decodedText);
          } finally {
            scanHandlingRef.current = false;

            try {
              scanner.resume();
            } catch {
              // Scanner may already have stopped.
            }
          }
        },
        () => {
          // QR codes may not be visible in every camera frame.
        }
      );

      setScannerRunning(true);
    } catch (error) {
      scannerRef.current = null;
      setMessage(
        error.message ||
          "Could not start the camera. Allow camera access or use manual entry."
      );
    } finally {
      setStarting(false);
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      await scanner.clear();
    } catch {
      // Ignore cleanup errors if the scanner is already stopped.
    } finally {
      scannerRef.current = null;
      scanHandlingRef.current = false;
      setScannerRunning(false);
    }
  }

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner) {
        if (scanner.isScanning) {
          scanner
            .stop()
            .then(() => scanner.clear())
            .catch(() => {});
        } else {
          scanner.clear().catch(() => {});
        }
      }
    };
  }, []);

  function handleManualSubmit(event) {
    event.preventDefault();
    verifyTicket(manualCode);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm text-pink-300">
            EventMesh / Organizer
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            QR Ticket Scanner
          </h1>

          <p className="mt-3 text-slate-400">
            Scan an attendee&apos;s ticket to validate it and record their
            check-in.
          </p>

          <Link
            to="/"
            className="mt-4 inline-block text-sm text-pink-300 hover:text-pink-200"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Scan QR code</h2>

            <p className="mt-2 text-sm text-slate-400">
              Allow camera access and position the attendee&apos;s QR code
              inside the scanning frame.
            </p>

            <div
              id="eventmesh-qr-reader"
              className="mt-5 overflow-hidden rounded-xl bg-white text-slate-900"
            />

            <div className="mt-5 flex flex-wrap gap-3">
              {!scannerRunning ? (
                <button
                  type="button"
                  onClick={startScanner}
                  disabled={starting}
                  className="rounded-lg bg-pink-400 px-5 py-3 font-semibold text-slate-950 hover:bg-pink-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {starting ? "Starting camera..." : "Start Camera"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopScanner}
                  className="rounded-lg border border-slate-600 px-5 py-3 font-semibold hover:bg-slate-800"
                >
                  Stop Camera
                </button>
              )}
            </div>

            {message && (
              <p className="mt-4 rounded-lg bg-amber-950/40 p-3 text-sm text-amber-200">
                {message}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Enter ticket code</h2>

            <p className="mt-2 text-sm text-slate-400">
              If the camera is unavailable, enter the ticket code printed
              beneath the attendee&apos;s QR code.
            </p>

            <form
              onSubmit={handleManualSubmit}
              className="mt-5 space-y-4"
            >
              <label
                htmlFor="ticket-code"
                className="block text-sm font-medium text-slate-300"
              >
                Ticket code
              </label>

              <input
                id="ticket-code"
                type="text"
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                placeholder="Enter the full ticket code"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-pink-400"
                required
              />

              <button
                type="submit"
                disabled={!manualCode.trim() || processing}
                className="w-full rounded-lg bg-pink-400 px-5 py-3 font-semibold text-slate-950 hover:bg-pink-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? "Verifying ticket..." : "Verify and Check In"}
              </button>
            </form>

            {result && (
              <div
                role="status"
                aria-live="polite"
                className={`mt-6 rounded-xl border p-5 ${
                  result.success
                    ? "border-emerald-700 bg-emerald-950/40"
                    : "border-red-800 bg-red-950/40"
                }`}
              >
                <h3 className="text-lg font-bold">{result.title}</h3>

                <p className="mt-2 text-sm">{result.message}</p>

                {result.success && result.ticket && (
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <p>Ticket ID: {result.ticket.id}</p>
                    <p>Booking ID: {result.ticket.booking_id}</p>
                    <p>Status: {result.ticket.status}</p>
                    <p>
                      Checked in:{" "}
                      {result.ticket.checked_in_at
                        ? new Date(
                            result.ticket.checked_in_at
                          ).toLocaleString("en-IN")
                        : "Confirmed"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-semibold">Important</h2>

          <p className="mt-2 text-sm text-slate-400">
            Each valid ticket can be checked in only once. A used or
            cancelled ticket will be rejected by the backend. Only an
            authenticated organizer who owns the event can check in its
            tickets.
          </p>
        </div>
      </div>
    </main>
  );
}

export default OrganizerScanner;
