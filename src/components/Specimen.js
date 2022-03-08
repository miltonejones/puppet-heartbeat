export const specimenText = `
 

it("has proper fields", async () => {


  const firstNameInput = screen.queryByTestId("firstNameInput");
  const lastNameInput = screen.queryByTestId("lastNameInput");
  const middleInitialInput = screen.queryByTestId("middleInitialInput");
  const suffixInput = screen.queryByTestId("suffixInput");
  const pronounsInput = screen.queryByTestId("pronounsInput");
  const addressLine2Input = screen.queryByTestId("addressLine2Input");
  const cityInput = screen.queryByTestId("cityInput");
  const zipCodeInput = screen.queryByTestId("zipCodeInput");
  const stateInput = getElementById("state");
  const sameMailingAddressCheckbox =
    getElementById("addressCheckbox");

  expect(firstNameInput).toBeInTheDocument();
  expect(lastNameInput).toBeInTheDocument();
  expect(middleInitialInput).toBeInTheDocument();
  expect(suffixInput).toBeInTheDocument();
  expect(pronounsInput).toBeInTheDocument();
  expect(addressLine2Input).toBeInTheDocument();
  expect(cityInput).toBeInTheDocument();
  expect(zipCodeInput).toBeInTheDocument();
  expect(stateInput).toBeInTheDocument();
  expect(sameMailingAddressCheckbox).toBeInTheDocument();

  await act(async () => {
    return await fireEvent.click(sameMailingAddressCheckbox);
  });

  const address1Input = screen.queryByTestId("addressInput1");
  const address1Line2Input = screen.queryByTestId("address1Line2Input");
  const city1Input = screen.queryByTestId("city1Input");
  const zipCode1Input = screen.queryByTestId("zipCode1Input");
  const state1Input = getElementById("state1");

  expect(address1Input).toBeInTheDocument();
  expect(address1Line2Input).toBeInTheDocument();
  expect(city1Input).toBeInTheDocument();
  expect(zipCode1Input).toBeInTheDocument();
  expect(state1Input).toBeInTheDocument();
}, 30000);
 

it("triggers events on input fields", async () => {
 

  const suffixInput = screen.queryByTestId("suffixInput");
  fireEvent.change(suffixInput, { target: { value: "Sr." } });
  expect(suffixInput).toBeInTheDocument("Sr.");

  const pronounsInput = screen.queryByTestId("pronounsInput");
  fireEvent.change(pronounsInput, { target: { value: "she/her/hers" } });
  expect(pronounsInput).toBeInTheDocument("she/her/hers");

  const addressLine2Input = screen.queryByTestId("addressLine2Input");
  fireEvent.change(addressLine2Input, { target: { value: "addressline2" } });
  expect(addressLine2Input).toBeInTheDocument("addressline2");

  const cityInput = screen.queryByTestId("cityInput");
  fireEvent.change(cityInput, { target: { value: "Atlanta" } });
  expect(cityInput).toBeInTheDocument("Atlanta");

  const zipCodeInput = screen.queryByTestId("zipCodeInput");
  fireEvent.change(zipCodeInput, { target: { value: "12345" } });
  expect(zipCodeInput).toBeInTheDocument("12345");
  fireEvent.blur(zipCodeInput);

  const stateInputDropDown = screen.queryByTestId("state");
  const stateInput = within(stateInputDropDown).getByRole("textbox");

  stateInput.focus();

  fireEvent.change(stateInput, {
    target: { value: "Texas" },
  });

  expect(stateInput.value).toEqual("Texas");
}, 30000);

`;
