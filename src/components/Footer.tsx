import React from "react";

const Footer: React.FC = () => (
  <footer className="mt-8 w-full border-t bg-gray-100 px-6 py-4 text-center text-sm text-gray-600">
    <div>
      <strong>TP Scry</strong> is an independent project and is{" "}
      <span className="font-semibold">
        not affiliated with, endorsed by, or associated with Transperth, the
        Public Transport Authority of Western Australia, or any government
        agency
      </span>
      .
      <br />
      All data is sourced from publicly accessible information and is provided
      "as is" without any warranties or guarantees of accuracy, completeness, or
      timeliness.
      <br />
      Use of this site is at your own risk. TP Scry and its creators accept no
      liability for any loss, damage, or inconvenience caused by reliance on the
      information provided.
      <br />
      &copy; {new Date().getFullYear()} TP Scry. All rights reserved.
    </div>
  </footer>
);

export default Footer;
