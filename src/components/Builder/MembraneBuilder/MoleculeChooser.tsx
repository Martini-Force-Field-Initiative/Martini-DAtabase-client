import { debugDir, debugLog } from '../../../logger';
import React from "react";
import {
  Box,
  withStyles,
  Link,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  DialogContentText,
  CircularProgress,
  LinearProgress,
} from "@material-ui/core";
import AddMoleculeFileInput from "../../AddMolecule/AddMoleculeFileInput";
import { toast } from "../../Toaster";
import { Marger, FaIcon, loadMartinizeFiles } from "../../../helpers";
import ApiHelper from "../../../ApiHelper";
import { Molecule, ReadedJobDoc } from "../../../types/entities";
import { SimpleSelect } from "../../../Shared";
import Settings from "../../../Settings";
import { Link as RouterLink } from "react-router-dom";
import HistoryBuild from "../HistoryBuild";
import Chip from "@material-ui/core/Chip";

export interface MoleculeWithFiles {
  pdb: File;
  top: File;
  itps: File[];
  force_field: string;
  builder_mode?: string;
  id?: string;
}

interface MCProps {
  Force_field: boolean;
  AddMolecule: string;
  classes: Record<string, string>;
  onMoleculeChoose(molecule: MoleculeWithFiles | Molecule | undefined): any;
  ffLibs?: string[];
}

interface MCState {
  pdb?: File;
  top?: File;
  itps: File[];
  ff: string;
  modal_chooser: boolean;
  builder_mode: string;
  status: "loading" | "loaded";
}

class MoleculeChooser extends React.Component<MCProps, MCState> {
  state: MCState = {
    itps: [],
    modal_chooser: false,
    ff: "martini3001",
    builder_mode: "classic",
    status: "loading",
  };

  // here
  nextFromFiles = () => {
    if (this.props.AddMolecule === "true") {
      const { pdb, top, itps, ff, builder_mode } = this.state;

      if (pdb && top && itps.length) {
        this.props.onMoleculeChoose({
          pdb,
          top,
          itps,
          force_field: ff,
          builder_mode,
        });
      } else {
        toast("Some required files are missing.", "error");
      }
    } else {
      this.props.onMoleculeChoose(undefined);
    }
  };

  nextFromMolecule = (molecule: Molecule) => {
    this.setState({ modal_chooser: false });
    molecule.builder_mode = this.state.builder_mode;
    this.props.onMoleculeChoose(molecule);
  };

  // here
  get can_continue() {
    if (this.props.AddMolecule === "false") {
      return this.props.Force_field;
    } else {
      const { pdb, top, itps } = this.state;

      return !!(pdb && top && itps.length);
    }
  }

  get force_fields() {
    return Settings.martinize_variables.force_fields;
  }

  render() {
    return (
      <React.Fragment>
        {this.state.status === "loading" && (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
            Loading your history
          </Box>
        )}

        {this.props.AddMolecule === "true" && (
          <div
            style={{
              visibility:
                this.state.status === "loading" ? "hidden" : "visible",
            }}
          >
            <ModalMoleculeSelector
              open={this.state.modal_chooser}
              onChoose={this.nextFromMolecule}
              onCancel={() => this.setState({ modal_chooser: false })}
            />
            <Marger size="1rem" />

            <Typography align="center" variant="h6">
              Load from database
            </Typography>

            <Marger size="1rem" />

            <div style={{ textAlign: "center" }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => this.setState({ modal_chooser: true })}
              >
                Search a molecule
              </Button>
            </div>

            <Marger size="2rem" />

            <Typography align="center" variant="h6">
              Load from history
            </Typography>

            <Typography align="center">
              <Link component={RouterLink} to="/builder">
                Want to martinize a molecule ?
              </Link>
            </Typography>
            <Marger size="1rem" />

            <HistoryBuild
              onLoaded={() => this.setState({ status: "loaded" })}
              onSelect={async (uuid: string) => {
                const job: ReadedJobDoc = await ApiHelper.request(
                  `history/get?jobId=${uuid}`,
                );
                const martinizeFiles = await loadMartinizeFiles(job);

                this.setState(
                  {
                    pdb: martinizeFiles.pdb.content,
                    top: martinizeFiles.top.content,
                    itps: martinizeFiles.itps.map((itp) => itp.content),
                    ff: job.settings.ff,
                    builder_mode: job.settings.builder_mode,
                  },
                  this.nextFromFiles,
                );
              }}
            />

            <div
              style={{
                visibility:
                  this.state.status === "loading" ? "hidden" : "visible",
              }}
            >
              <Marger size="1rem" />

              <Typography align="center" variant="h6">
                Upload a molecule
              </Typography>

              <Marger size="1rem" />

              <SimpleSelect
                label="Used force field"
                variant="standard"
                id="ff_select"
                values={this.force_fields
                  .filter(
                    (ff: string) =>
                      Settings.martinize_variables.force_fields_info[ff]
                        .insane_support,
                  )
                  .map((e) => ({ id: e, name: e }))}
                value={this.state.ff}
                onChange={(val) => this.setState({ ff: val })}
                noMinWidth
                formControlClass={this.props.classes.ff_select}
              />

              <Marger size="1rem" />

              <AddMoleculeFileInput
                onChange={({ itp, top, pdb }) => {
                  this.setState({
                    pdb,
                    top,
                    itps: itp,
                  });
                }}
              />
            </div>
          </div>
        )}

        {this.state.status === "loaded" && (
          <>
            <Marger size="1rem" />

            <div style={{ textAlign: "right" }}>
              <Button
                variant="outlined"
                color="primary"
                disabled={!this.can_continue}
                onClick={this.nextFromFiles}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </React.Fragment>
    );
  }
}

export default withStyles((theme) => ({
  ff_select: {
    width: "100%",
  },
}))(MoleculeChooser);

interface ModalState {
  search: string;
  loading: boolean;
  displayed_molecules: Molecule[];
  load_more: boolean;
  content: string;
  oups: boolean;
}

interface ModalProps {
  open: boolean;
  onChoose(molecule: Molecule): any;
  onCancel(): any;
  moleculeFilter?(molecule: Molecule): boolean;
  filterTitle?: string;
}

export class ModalMoleculeSelector extends React.Component<
  ModalProps,
  ModalState
> {
  timeout: NodeJS.Timeout | undefined;
  all_molecules: Molecule[] = [];
  // Infinite-scroll plumbing (see attachSentinel): the scrollable dialog body
  // is the observer root; the observer watches a bottom sentinel.
  dialogContentRef = React.createRef<HTMLDivElement>();
  sentinelObserver: IntersectionObserver | null = null;
  // Number of records consumed from the backend's paged ordering. Tracked
  // separately from all_molecules.length because we dedupe (see addUnique): the
  // skip offset must reflect what the backend returned, not what we kept.
  fetchedCount = 0;

  // Append molecules not already present by id. Backend pagination can return
  // the same molecule across pages; without deduping, React warns about
  // duplicate keys (key={m.id}) in the rendered list.
  addUnique = (molecules: Molecule[]) => {
    const seen = new Set(this.all_molecules.map((m) => m.id));
    for (const m of molecules) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      this.all_molecules.push(m);
    }
  };

  state: ModalState = {
    search: "",
    loading: false,
    displayed_molecules: [],
    load_more: false,
    content: "",
    oups: false,
  };

  onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    this.setState({ search: e.target.value });

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }

    const content = e.target.value.trim();
    if (content) {
      this.timeout = setTimeout(() => {
        this.timeout = undefined;
        this.startSearch(content);
      }, 350);
    } else {
      this.all_molecules = [];
      this.fetchedCount = 0;
      this.setState({
        content: "",
        displayed_molecules: [],
        load_more: false,
        loading: false,
        oups: false,
      });
    }
  };

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
    this.sentinelObserver?.disconnect();
  }

  // Infinite scroll: a sentinel rendered at the bottom of the list triggers the
  // next page when it scrolls into the DialogContent viewport. Using a callback
  // ref lets us (dis)connect the observer exactly as the sentinel mounts (it
  // only exists while load_more is true).
  attachSentinel = (node: HTMLDivElement | null) => {
    this.sentinelObserver?.disconnect();
    this.sentinelObserver = null;
    if (!node) return;

    this.sentinelObserver = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          this.state.load_more &&
          !this.state.loading
        ) {
          this.enlargeSearch();
        }
      },
      // root = the scrollable dialog body; preload a bit before the bottom.
      { root: this.dialogContentRef.current, rootMargin: "200px" },
    );
    this.sentinelObserver.observe(node);
  };

  // Auto-load pages up front, but cap the initial fetch. Beyond this, scrolling
  // to the bottom auto-loads more (see attachSentinel).
  static readonly INITIAL_CAP = 50;

  async startSearch(content: string) {
    this.all_molecules = [];
    this.fetchedCount = 0;
    this.setState({
      loading: true,
      load_more: false,
      content: "",
      displayed_molecules: [],
    });

    try {
      const PAGE = 10;
      let length = Infinity;

      // Fetch every page up front until the backend is exhausted or we hit the
      // cap on unique molecules.
      while (
        this.fetchedCount < length &&
        this.all_molecules.length < ModalMoleculeSelector.INITIAL_CAP
      ) {
        const {
          molecules,
          length: total,
        }: { molecules: Molecule[]; length: number } = await ApiHelper.request(
          "molecule/list",
          {
            parameters: {
              q: content,
              combine: "false",
              limit: PAGE,
              skip: this.fetchedCount,
            },
          },
        );

        length = total;
        // Advance the backend offset by what was returned (incl. any dupes),
        // but only keep molecules we haven't seen yet.
        this.fetchedCount += molecules.length;
        this.addUnique(molecules);

        // Guard against a stale/short page that would never reach `length`.
        if (molecules.length === 0) break;
      }

      console.warn("startSearch:all_molecules");
      debugDir(this.all_molecules);

      let filtered_molecules: Molecule[] = [];
      if (this.props.moleculeFilter) {
        filtered_molecules = this.all_molecules.filter(
          this.props.moleculeFilter,
        );
        console.warn("startSearch:Molecules filtred");
        debugDir(filtered_molecules);
      }

      if (this.state.loading)
        this.setState({
          displayed_molecules: this.props.moleculeFilter
            ? filtered_molecules
            : this.all_molecules,
          load_more: this.fetchedCount < length,
          content,
        });
    } catch (e) {
      toast("Error while loading molecules.", "error");
      this.setState({ oups: true });
    } finally {
      this.setState({ loading: false });
    }
  }

  async enlargeSearch() {
    /*
    const deduped = (ms: Molecule[]): Molecule[] => {
      const unique = new Map<string, Molecule>();
      ms.forEach((m) => {
        unique.set(m.id, m);
      });
      return Array.from(unique.values());
    };
*/
    const content = this.state.content;

    this.setState({ loading: true, load_more: false });

    try {
      const { molecules, length }: { molecules: Molecule[]; length: number } =
        await ApiHelper.request("molecule/list", {
          parameters: {
            q: content,
            combine: "false",
            limit: 10,
            skip: this.fetchedCount,
          },
        });

      // Advance the backend offset by what was returned, dedupe into the list.
      this.fetchedCount += molecules.length;
      this.addUnique(molecules);
      console.warn("enlargeSearch:all_molecules");
      debugDir(this.all_molecules);
      let filtered_molecules: Molecule[] = [];
      if (this.props.moleculeFilter) {
        filtered_molecules = this.all_molecules.filter(
          this.props.moleculeFilter,
        );
        console.warn("enlargeSearch:Molecules filtred");
        debugDir(filtered_molecules);
      }
      this.setState({
        displayed_molecules: this.props.moleculeFilter
          ? filtered_molecules
          : this.all_molecules,
        load_more: this.fetchedCount < length,
      });
    } catch (e) {
      toast("Error while loading molecules.", "error");
    } finally {
      this.setState({ loading: false });
    }
  }

  openUrl(molecule: Molecule) {
    window.open(
      "/molecule/" + molecule.alias + "?version=" + molecule.id,
      "_blank",
    );
  }

  render() {
    /*   debugLog(
      `ModalMoleculeSelector:: rendering w/ ff ${this.props.ff} ${this.props.ffLibs}`,
    );
*/
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Find a{" "}
          <span style={{ color: "steelblue" }}>
            {this.props.filterTitle !== undefined ? this.props.filterTitle : ""}
          </span>{" "}
          molecule
        </DialogTitle>

        <DialogContent ref={this.dialogContentRef}>
          <div>
            <TextField
              value={this.state.search}
              onChange={this.onInputChange}
              placeholder="Enter a query..."
              style={{ width: "100%" }}
              variant="outlined"
            />
          </div>

          <Marger size="1rem" />

          {this.state.displayed_molecules.length > 0 && (
            <List>
              {this.state.displayed_molecules.map((m) => (
                <ListItem
                  key={m.id}
                  button
                  onClick={() => this.props.onChoose(m)}
                >
                  <ListItemText
                    key={`${m.name} (${m.alias}) - ${m.force_field} - Version ${m.version}`}
                    primary={`${m.name} (${m.alias}) - ${m.force_field} - Version ${m.version}`}
                  />
                  <ListItemSecondaryAction>
                    {m.category.map((c) => (
                      <Chip
                        label={c}
                        size="small"
                        color="secondary"
                        key={`${m.name} (${m.alias}) - ${m.force_field} - Version ${m.version} ${c}`}
                      />
                    ))}
                    <IconButton edge="end" onClick={() => this.openUrl(m)}>
                      <FaIcon external-link-alt />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {/* Infinite-scroll sentinel: when it enters view the next page loads.
              While loading, load_more is false so the sentinel unmounts (the
              observer detaches) and the spinner below shows; once the page
              arrives it remounts and, if still in view, chains the next load. */}
          {this.state.load_more && (
            <div ref={this.attachSentinel} style={{ height: 1 }} />
          )}

          {this.state.loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <CircularProgress size={48} />
            </div>
          )}

          {this.state.displayed_molecules.length === 0 &&
            this.state.content &&
            !this.state.loading && (
              <div>
                <DialogContentText align="center">
                  No molecule matches your search.
                </DialogContentText>
              </div>
            )}
        </DialogContent>

        <DialogActions>
          <Button color="secondary" onClick={this.props.onCancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
