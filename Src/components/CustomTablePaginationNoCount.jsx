import PropTypes from 'prop-types';


// MUI components
import {
    Box,
    IconButton,
    TableFooter,
    TablePagination,
    TableRow
  } from '@mui/material';


  import FirstPageIcon from '@mui/icons-material/FirstPage';
  import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
  import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
  


//for pagination
 function TablePaginationActions(props) {
    const { page, onPageChange, prevLink, nextLink } = props;
  
    const handleFirstPageButtonClick = (event) => {
      onPageChange(event, 0);
    };
  
    const handleBackButtonClick = (event) => {
      onPageChange(event, page - 1);
    };
  
    const handleNextButtonClick = (event) => {
      onPageChange(event, page + 1);
    };
  
  
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          <FirstPageIcon />
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={!prevLink}
          aria-label="previous page"
        >
          <KeyboardArrowLeft />
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={!nextLink}
          aria-label="next page"
        >
          <KeyboardArrowRight />
        </IconButton>
      </Box>
    );
  }

  TablePaginationActions.propTypes = {
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    prevLink: PropTypes.string.isRequired,
    nextLink: PropTypes.string.isRequired
  };


  export default function CustomTablePaginationNoCount(props) {
    const { page, rowsPerPage, prevLink, nextLink, colSpan, onPaginationChange, inShort, curCount } = props;

      
    
      const handleChangePage = (event, newPage) => {
        //setPage(newPage);
        //console.log("Page changed: " + newPage);
        onPaginationChange(newPage, rowsPerPage);
      };
  
      const handleChangeRowsPerPage = (event) => {
        //setRowsPerPage(parseInt(event.target.value, 10));
        //setPage(0);
        onPaginationChange(0, parseInt(event.target.value, 10));
      };

      return (
        <TableFooter>
          <TableRow >
            <TablePagination 
                rowsPerPageOptions={inShort==true?[rowsPerPage]:[5, 10, 25, 50, 100]}
                count={nextLink ? -1 : (page * rowsPerPage + curCount)}
                colSpan={colSpan}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                inputProps: {
                    'aria-label': 'rows per page',
                },
                native: true,
                }}
                
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={(subProps) => <TablePaginationActions {...subProps} prevLink={prevLink} nextLink={nextLink} />} 
                sx={{
                  overflow: "hidden",
                  overflowY: "auto", 
                  overflowX: "auto", 
                  "&::-webkit-scrollbar": {
                    height: 3,
                    width: 3,
                    borderRadius: 2
                    },
                    "&::-webkit-scrollbar-track": {
                    backgroundColor: "white"
                    },
                    "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "gray",
                    borderRadius: 2
                    }
                    }}
            />
           
          </TableRow>
        </TableFooter>
      );
  }