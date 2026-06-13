import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import HarvardCVDocument from "./HarvardCVDocument";

export default function PDFDownloadButton({ data, fileName = "Harvard_CV.pdf" }) {
  return (
    <PDFDownloadLink
      document={<HarvardCVDocument data={data} />}
      fileName={fileName}
      className="btn-primary w-full sm:w-auto"
    >
      {({ loading }) =>
        loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing PDF...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download Harvard CV (PDF)
          </>
        )
      }
    </PDFDownloadLink>
  );
}