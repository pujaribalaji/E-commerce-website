import React, { Component } from "react";

export class ChatBot extends Component {
  componentDidMount() {
    (function (d, m) {
      var kommunicateSettings = {
        appId: "2029ec5deb9c9abe6ed5798333e8d1562",
        popupWidget: true,
        automaticChatOpenOnNavigation: true,
      };
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
      var h = document.getElementsByTagName("head")[0];
      h.appendChild(s);
      window.kommunicate = m;
      m._globals = kommunicateSettings;
    })(document, window.kommunicate || {});
    /* NOTE : Use web server to view HTML files as real-time update will not work if you directly open the HTML file in the browser. */
  }
  render() {
    return (
      <>
        <div></div>
      </>
    );
  }
}

export default ChatBot;
