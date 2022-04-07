
import {  TextField, Stack, Button  } from '@mui/material';
import { Flex, Spacer } from './Control';
import React from 'react'; 


export function JsonColor(json, classes, spacing = 2) {
    if (!json) return "";
    if (typeof json != "string") {
      json = JSON.stringify(json, undefined, spacing);
    }
    json = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      function (match) {
        var cls = "numberCode";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "keyCode";
          } else {
            cls = "stringCode";
          }
        } else if (/true|false/.test(match)) {
          cls = "booleanCode";
        } else if (/null/.test(match)) {
          cls = "nullCode";
        }
        return (
          '<span data-json-value="' +
          match.replace(/"/g, "") +
          '" class="' +
          cls + 
          '">' +
          match +
          "</span>"
        );
      }
    );
   }
    
export default function JsonContent ({ editMode, children, rows = 56, setValue, ...props }) {
    const [markup, setMarkup] = React.useState(children);
    const classes = {};

    if (!!editMode) {
      return <Stack>
        <TextField
          classes={{ root: 'code-field mono' }}
          fullWidth
          value={markup}
          multiline
          rows={rows}
          onChange={(e) => setMarkup(e.target.value)}
        />
        <Flex>
          <Spacer />
          <Button sx={{m: 1}} variant="contained" onClick={() => {
              try {
                const json = JSON.parse(markup);
                setValue && setValue(json);
              } catch (e) {
                alert ('Cannot save invalid JSON')
              }
            }}>save</Button>
        </Flex>
      </Stack>
    }

    return  <pre className="mono"
      dangerouslySetInnerHTML={{
        __html: JsonColor(children, classes),
      }}
    />

  }