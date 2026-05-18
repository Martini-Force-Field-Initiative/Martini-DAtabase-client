import "./index.css";
import CopyToClipboard from "../SharedComponents/CopyToClipboard";
import { SectionProps } from "./types";
import { Box, Typography } from "@material-ui/core";
const Api = (props: SectionProps) => {
  return (
    <div className="container">
      <Typography variant="h2">RESTful API</Typography>
      <Typography component="div" variant="body1" style={{ marginTop: "2em" }}>
        The current API enables programmatic access to the same structures and
        topologies of the molecules hosted in the database. The API allows
        provides functionalities to sort, list or download files, making it
        possible to embed the fetching of models inside automatic/script
        procedures.
      </Typography>
      <Typography component="div" variant="body1" style={{ marginTop: "1em" }}>
        The advantages of having this API include:
        <Typography component="div" variant="subtitle2">
          <ul>
            <li> Easy access to the Martini Database's data and resources</li>
            <li>
              Flexibility and convenience in accessing and working with the data
            </li>
            <li>
              Ability to automate tasks and integration with other tools and
              systems
            </li>
            <li>
              Enabling third-party developers to build new applications using
              the data and functionality of the Martini Database.
            </li>
          </ul>
        </Typography>
      </Typography>

      <Typography
        variant="h4"
        component="div"
        style={{ marginTop: "2em", marginBottom: "0.5em" }}
      >
        Technical section
      </Typography>

      <Typography
        variant="body1"
        component="div"
        style={{ marginBottom: "1em" }}
      >
        Perform a GET to download molecule files or retrieve forcefield
        information. The format of the ressource URL has the following
        structure:
      </Typography>
      <code>
        <b>https://mad.ens-lyon.fr/api/molecule/get/</b>
        <span style={{ color: "teal" }}>[forcefield]</span>
        <b>/</b>
        <span style={{ color: "teal" }}>[molecule_name][extension]</span>
        <b>/</b>
        <span style={{ color: "teal" }}>[version]</span>
      </code>
      <div className="table sectionedit4" style={{ marginTop: "1em" }}>
        <table className="inline">
          <thead>
            <tr className="row0">
              <th className="col0">Parameter</th>
              <th className="col1">Mandatory</th>
              <th className="col2">Default</th>
              <th className="col3">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="row1">
              <td className="col0">forcefield</td>
              <td className="col1">yes</td>
              <td className="col2">None</td>
              <td className="col3">
                {" "}
                The desired forcefield version (eg: martini22, martini3001)
              </td>
            </tr>
            <tr className="row2">
              <td className="col0">molecule_name</td>
              <td className="col1">no</td>
              <td className="col2">None</td>
              <td className="col4">
                Name (Alias) of your molecule (example: POPE)
              </td>
            </tr>
            <tr className="row3">
              <td className="col0">extension</td>
              <td className="col1">no</td>
              <td className="col2">.zip</td>
              <td className="col3">
                You can ask for a specific type of file ('.itp', '.gro', '.pdb')
                or you can download everything in zip format, in this case adds
                '.zip' or nothing).
              </td>
            </tr>
            <tr className="row3">
              <td className="col0">Version</td>
              <td className="col1">no</td>
              <td className="col2">1.0</td>
              <td className="col3">
                (Optional) In case of molecule with many versions, specify a
                particular version.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Typography
        variant="h4"
        component="div"
        style={{ marginTop: "2em", marginBottom: "0.5em" }}
      >
        Examples
      </Typography>
      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "4em",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            component="div"
            style={{
              fontSize: "1.25em",
              display: "flex", // ✅ make it flex
              alignItems: "center", // ✅ vertical alignment
              gap: "0.3em",
            }}
          >
            <i className="material-icons inline-icon tiny">
              keyboard_arrow_right
            </i>{" "}
            List the available models of a particular forcefield:
          </Typography>
        </Box>
        <Box style={{ maxWidth: "36em", paddingTop: "0.5em" }}>
          <CopyToClipboard inputText="https://mad.ens-lyon.fr/api/molecule/get/martini3001" />
        </Box>
      </Box>
      <pre
        className="output"
        style={{
          whiteSpace: "pre-wrap", // preserves line breaks but allows wrapping
          wordWrap: "break-word", // breaks long words instead of overflowing
          maxWidth: "100%", // optional: limit width
          padding: "0.2em",
          borderRadius: "8px",
          background: "skyblue",
          overflow: "hidden", // ensures no scrollbars
        }}
      >
        <code>
          {JSON.stringify(
            {
              "0": {
                alias: "DAPA",
                name: "di-C20:4-C22:5 PA (DAPA)",
                citation: `Souza, P.C.T.; Alessandri, R.; Barnoud, J.; Thallmair, S.; Faustino, I.; Grünewald, F.; Patmanidis,
              I.; Abdizadeh, H.; Bruininks, B.M.H.;\nWassenaar, T.A.; Kroon, P.C.; Melcr, J.; Nieto, V.; Corradi, V.; Khan,
              H.M.; Domański, J.; Javanainen, M.; Martinez-Seara, H.;\nReuter, N.; Best, R.B.; Vattulainen, I.; Monticelli, L.;
              Periole, X.; Tieleman, D.P.; de Vries, A.H.; Marrink, S.J.; Nature Methods\n2021; 10.1038/s41592-021-01098-3`,
                category: "Lipids",
                version: ["1.0"],
              },
              "1": {
                alias: "DAPC",
                name: "di-C20:4-C22:5 PC (DAPC)",
                citation: `Souza, P.C.T.; Alessandri, R.; Barnoud, J.; Thallmair, S.; Faustino, I.; Grünewald, F.; Patmanidis,
              I.; Abdizadeh, H.; Bruininks, B.M.H.;\nWassenaar, T.A.; Kroon, P.C.; Melcr, J.; Nieto, V.; Corradi, V.; Khan,
              H.M.; Domański, J.; Javanainen, M.; Martinez-Seara, H.;\nReuter, N.; Best, R.B.; Vattulainen, I.; Monticelli, L.;
              Periole, X.; Tieleman, D.P.; de Vries, A.H.; Marrink, S.J.; Nature Methods\n2021; 10.1038/s41592-021-01098-3`,
                category: "Lipids",
                version: ["1.0"],
              },
            },
            null,
            2,
          ).replace(/\\n/g, "\n\t\t")}
        </code>
      </pre>

      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "4em",
          alignItems: "center",
          paddingTop: "1.5em",
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            component="div"
            style={{
              fontSize: "1.25em",
              display: "flex", // ✅ make it flex
              alignItems: "center", // ✅ vertical alignment
              gap: "0.3em",
            }}
          >
            <i className="material-icons inline-icon tiny">
              keyboard_arrow_right
            </i>{" "}
            Fetch the ITP file of a specific combination of molecule and
            forcefield:
          </Typography>
        </Box>
        <Box style={{ maxWidth: "36em", paddingTop: "0.5em" }}>
          <CopyToClipboard inputText="https://mad.ens-lyon.fr/api/molecule/get/martini3001/DAPA.itp" />
        </Box>
      </Box>
      <pre
        className="output"
        style={{
          whiteSpace: "pre-wrap", // preserves line breaks but allows wrapping
          wordWrap: "break-word", // breaks long words instead of overflowing
          maxWidth: "100%", // optional: limit width
          padding: "0.2em",
          borderRadius: "8px",
          background: "skyblue",
          overflow: "hidden", // ensures no scrollbars
        }}
      >
        <code>
          {`;;;;;; Martini lipid topology for di-C20:4-C22:5 PA (DAPA)
          ;
          ; Description:
          ;   A general model phosphatidic acid (PA) lipid corresponding to atomistic e.g. C20:4(5c,8c,11c,14c) di-arachidonic acid (AA),
          ;   - C22:5(4c,7c,10c,13c,16c) docosapentaenoic acid tails.
          ; Parameterization:
          ;   This topology follows the standard Martini 3 lipid definitions for building blocks.  Further optimization in the bonded parameters are currently on development.
          ;
          ; Reference(s):
          ; Souza, P.C.T.; Alessandri, R.; Barnoud, J.; Thallmair, S.; Faustino, I.; Grünewald, F.; Patmanidis, I.; Abdizadeh, H.; Bruininks, B.M.H.;
          ; Wassenaar, T.A.; Kroon, P.C.; Melcr, J.; Nieto, V.; Corradi, V.; Khan, H.M.; Domański, J.; Javanainen, M.; Martinez-Seara, H.;
          ; Reuter, N.; Best, R.B.; Vattulainen, I.; Monticelli, L.; Periole, X.; Tieleman, D.P.; de Vries, A.H.; Marrink, S.J.;  Nature Methods
          ; 2021; 10.1038/s41592-021-01098-3
          ;
          ;@INSANE alhead=O, allink=G G, altail=DDDDC DDDDC, alname=DAPA, charge=-1.0
          ;@RESNTEST DAP==DAPA if: atoms[0]==PO4
          ;@BEADS PO4 GL1 GL2 D1A D2A D3A D4A C4A D1B D2B D3B D4B C4B
          ;@BONDS PO4-GL1 GL1-GL2 GL1-D1A D1A-D2A D2A-D3A D3A-D4A D4A-C4A GL2-D1B D1B-D2B D2B-D3B D3B-D4B D4B-C4B
          ;

          ; Command line
          ;	-o martini_v3.0_DAPA.itp -alname DAPA -alhead O -allink G G -altail DDDDC DDDDC
          ;


          ; Category
          ;	lipids
          ;
          ; Name
          ;	 di-C20:4-C22:5 PA (DAPA)
          ;
          ; Alias
          ;	DAPA
          ;
          ; Force field
          ;	martini3001
          ;
          ; Version
          ;	1.0
          ;

          [moleculetype]
          ; molname      nrexcl
            DAPA          1

          [atoms]
          ; id 	type 	resnr 	residu 	atom 	cgnr 	charge
             1 	Q5 	 1 	DAPA 	PO4 	 1 	-1.0
             2 	SN4a	 1 	DAPA 	GL1 	 2 	0
             3 	N4a	 1 	DAPA 	GL2 	 3 	0
             4 	C4h	 1 	DAPA 	D1A 	 4 	0
             5 	C4h	 1 	DAPA 	D2A 	 5 	0
             6 	C4h	 1 	DAPA 	D3A 	 6 	0
             7 	C4h	 1 	DAPA 	D4A 	 7 	0
             8 	C1 	 1 	DAPA 	C4A 	 8 	0
             9 	C4h	 1 	DAPA 	D1B 	 9 	0
            10 	C4h	 1 	DAPA 	D2B 	10 	0
            11 	C4h	 1 	DAPA 	D3B 	11 	0
            12 	C4h	 1 	DAPA 	D4B 	12 	0
            13 	C1 	 1 	DAPA 	C4B 	13 	0

          [bonds]
          ;  i  j 	funct 	length 	force.c.
             1  2 	1 	0.42 	1350
             2  3 	1 	0.312	2500
             2  4 	1 	0.47 	5000
             4  5 	1 	0.47 	3800
             5  6 	1 	0.47 	3800
             6  7 	1 	0.47 	3800
             7  8 	1 	0.47 	3800
             3  9 	1 	0.47 	3600
             9 10 	1 	0.47 	3800
            10 11 	1 	0.47 	3800
            11 12 	1 	0.47 	3800
            12 13 	1 	0.47 	3800

          [angles]
          ;  i  j  k 	funct 	angle 	force.c.
             1  2  3 	2 	108.0 	21.5
             1  2  4 	2 	139.1   31.2
             2  4  5 	2 	100.0 	10.0
             4  5  6 	2 	100.0 	10.0
             5  6  7 	2 	100.0 	10.0
             6  7  8 	2 	120.0 	35.0
             3  9 10 	2 	100.0 	10.0
             9 10 11 	2 	100.0 	10.0
            10 11 12 	2 	100.0 	10.0
            11 12 13 	2 	120.0 	35.0
            `}
        </code>
      </pre>

      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "4em",
          alignItems: "center",
          paddingTop: "1.5em",
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            component="div"
            style={{
              fontSize: "1.25em",
              display: "flex", // ✅ make it flex
              alignItems: "center", // ✅ vertical alignment
              gap: "0.3em",
            }}
          >
            <i className="material-icons inline-icon tiny">
              keyboard_arrow_right
            </i>{" "}
            Fetch the bundle files of the latest molecule model for a specific
            forcefield version:
          </Typography>
        </Box>
        <Box>
          <CopyToClipboard inputText="https://mad.ens-lyon.fr/api/molecule/get/martini3001/DAPA" />
        </Box>
      </Box>

      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "4em",
          alignItems: "center",
          paddingTop: "1.5em",
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            component="div"
            style={{
              fontSize: "1.25em",
              display: "flex", // ✅ make it flex
              alignItems: "center", // ✅ vertical alignment
              gap: "0.3em",
            }}
          >
            <i className="material-icons inline-icon tiny">
              keyboard_arrow_right
            </i>{" "}
            Fetch the bundle files of a particular combination of forcefield,
            molecule and model version:
          </Typography>
        </Box>
        <Box>
          <CopyToClipboard inputText="https://mad.ens-lyon.fr/api/molecule/get/martini3001/POPC/1.0" />
        </Box>
      </Box>
    </div>
  );
};

export default Api;
